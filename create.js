const debug = require('debug')('ara-filesystem:create')
const { info } = require('ara-console')
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
  if ((null == owner || 'string' !== typeof owner || !owner) && (null == did || 'string' !== typeof did || !did)) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  if (did) {
    if (0 === did.indexOf('did:')) {
      if (0 !== did.indexOf('did:ara:')) {
        throw new TypeError('Expecting a DID URI with an "ara" method.')
      } else {
        did = did.substring(8)
      }
    }

    const afsDid = did
    const keystore = await loadSecrets(kResolverKey)
    const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore })
    if (null === afsDdo || 'object' !== typeof afsDdo) {
      throw new TypeError('ara-filesystem.create: Unable to resolve AFS DID')
    }

    const pathPrefix = toHex(blake2b(Buffer.from(afsDid)))
    const path = createAFSKeyPath(afsDid)
    await pify(mkdirp)(rc.afs.archive.store)
    const nodes = resolve(rc.afs.archive.store, pathPrefix)
    const store = toilet(nodes)
    const drives = await pify(multidrive)(
      store,
      createArchive,
      closeArchive
    )

    const afs = await pify(drives.create)({
      id: pathPrefix,
      path
    })

    afs.did = afsDid
    afs.ddo = afsDdo

    info('AFS Public Key %s', toHex(afs.key))

    return afs
  } else if (owner) {
    if (0 === owner.indexOf('did:')) {
      if (0 !== owner.indexOf('did:ara:')) {
        throw new TypeError('Expecting a DID URI with an "ara" method.')
      } else {
        owner = owner.substring(8)
      }
    }

    // TODO (mahjiang): ensure ownership of DID
    const ddo = await aid.resolve(owner)
    if (null === ddo || 'object' !== typeof ddo) {
      throw new TypeError('ara-filesystem.create: Unable to resolve owner DID')
    }

    const mnemonic = bip39.generateMnemonic()
    info(mnemonic)
    const afsId = await aid.create(mnemonic, owner)

    let keystore = await loadSecrets(kArchiverKey)
    await aid.archive(afsId, { key: kArchiverKey, keystore })
    keystore = await loadSecrets(kResolverKey)
    const { publicKey, secretKey } = afsId
    const afsDid = toHex(publicKey)
    const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore })

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

    info('AFS Public Key %s', toHex(afs.key))

    return afs
  }

  return null

  async function createArchive(opts, done) {
    const { id, path } = opts
    try {
      const afs = await createCFS({ id, path })
      return done(null, afs)
    } catch (err) {
      done(err)
    }

    return null
  }

  async function closeArchive(afs, done) {
    try {
      await afs.close()
    } catch (err) {
      return done(err)
    }
    return done(null)
  }
}

async function loadSecrets(key) {
  const { public: pub } = await secrets.load({ key, public: true })
  return pub.keystore
}

module.exports = {
  create
}
