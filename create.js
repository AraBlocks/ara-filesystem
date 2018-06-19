const debug = require('debug')('ara-filesystem:create')
const { info, warn, error, log } = require('ara-console')
const { blake2b, keyPair } = require('ara-crypto')
const { createAFSKeyPath } = require('./key-path')
const { toHex } = require('ara-identity/util')
const { secrets } = require('ara-network')
const aid = require('./aid')
const bip39 = require('bip39')
const drives = require('./drives')

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

  // just owner -> create new AFS
  // just did -> try to resolve
}) {
  if ((null == owner || 'string' !== typeof owner) && (null == did || 'string' !== typeof did)) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  if (did) {
    if (0 == did.indexOf('did:ara:')) {
     did = did.substring(8)
    }
    const afsDid = did
    const path = createAFSKeyPath(afsDid)
    if (path in drives) {
      return drives[path]
    }
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
      // create AFS using identity as keypair
      const { createCFS } = require('cfsnet/create')
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
    info(afs.did)

    drives[path] = afs

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
