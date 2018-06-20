const debug = require('debug')('ara-filesystem:create')
const { info, warn, error, log } = require('ara-console')
const { blake2b, keyPair } = require('ara-crypto')
const { createAFSKeyPath } = require('./key-path')
const { toHex } = require('ara-identity/util')
const { secrets } = require('ara-network')
const { resolve } = require('path')
const { createCFS } = require('cfsnet/create')
const aid = require('./aid')
const bip39 = require('bip39')
const multidrive = require('multidrive')
const pify = require('pify')
const mkdirp = require('mkdirp')
const rc = require('./rc')()
const toilet = require('toiletdb')

const kArchiverKey = 'archiver'
const kResolverKey = 'resolver'

/**
 * Creates an AFS with the given Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function create({
  owner = null,
  did = null
}) {
  if ((null == owner || 'string' !== typeof owner) && (null == did || 'string' !== typeof did)) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  if (did) {
    if (0 == did.indexOf('did:ara:')) {
     did = did.substring(8)
    }
    const afsDid = did
    const pathPrefix = toHex(blake2b(Buffer.from(afsDid)))
    const path = createAFSKeyPath(afsDid)
  
    await pify(mkdirp)(rc.afs.archive.store)
    const nodes = resolve(rc.afs.archive.store, pathPrefix)
    const store = toilet(nodes)
    const drives = await pify(multidrive)(store,
      async function create(opts, done) {
        const id = toHex(blake2b(Buffer.from(afsDid)))
        try {
          const cfs = await createCFS({ id, path })        
          return done(null, cfs)
        } catch (err) {
          done(err)
        }
      },

      async function close(cfs, done) {
        try { await cfs.close() }
        catch (err) { return done(err) }
        return done(null)
      })

    const afs = await pify(drives.create)({
      id: toHex(blake2b(Buffer.from(afsDid)))
    })
  
    const keystore = await loadSecrets(kResolverKey)
    const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore } )

    afs.did = afsDid
    afs.ddo = afsDdo

    info("AFS Public Key %s", toHex(afs.key))

    return afs

  } else if (owner) {
  // TODO (mahjiang): ensure ownership of DID
    await aid.resolve(owner)
    const mnemonic = bip39.generateMnemonic()
    info(mnemonic)
    const afsId = await aid.create(mnemonic, owner)

    let keystore = await loadSecrets(kArchiverKey)
    await aid.archive(afsId, { key: kArchiverKey, keystore } )

    keystore = await loadSecrets(kResolverKey)
    const { publicKey, secretKey } = afsId
    const afsDid = publicKey.toString('hex')
    const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore } )

    const seed = blake2b(secretKey)
    const kp = keyPair(seed)
    const id = toHex(blake2b(Buffer.from(afsDid)))
    let afs
    let path
    try {
      // generate AFS key path
    
      path = createAFSKeyPath(afsDid)
      info(path)
      afs = await createCFS({
        id,
        key: kp.publicKey,
        secretKey: kp.secretKey,
        path
      })
    } catch (err) { debug(err.stack || err) }

    // clear buffers
    kp.publicKey.fill(0)
    kp.secretKey.fill(0)

    afs.did = afsDid
    afs.ddo = afsDdo

    info("AFS Public Key %s", toHex(afs.key))

    return afs
  }
}

async function loadSecrets(key) {
  const { public: pub } = await secrets.load({ key, public: true })
  return pub.keystore
}

module.exports = {
  create
}
