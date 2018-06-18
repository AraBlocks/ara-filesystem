const debug = require('debug')('ara-filesystem:create')
const { blake2b, keyPair } = require('ara-crypto')
const { createAFSKeyPath } = require('./key-path')
const { toHex } = require('ara-identity/util')
const { secrets } = require('ara-network')
const aid = require('./aid')

const kArchiverKey = 'archiver'
const kResolverKey = 'resolver'

/**
 * Creates an AFS with the given Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function create(did) {
  if (null == did || 'string' !== typeof did) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  await aid.resolve(did)
  const identity = await aid.create(did)

  let keystore = await loadSecrets(kArchiverKey)
  await aid.archive(identity, { key: kArchiverKey, keystore })

  keystore = await loadSecrets(kResolverKey)
  const { publicKey, secretKey } = identity
  const afsDid = publicKey.toString('hex')
  const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore })

  const seed = blake2b(secretKey)
  const kp = keyPair(seed)
  const id = toHex(kp.publicKey)

  let afs
  try {
    // generate AFS key path
    const path = createAFSKeyPath(afsDid)

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

  afs.ddo = afsDdo

  return afs
}

async function loadSecrets(key) {
  const { public: pub } = await secrets.load({ key, public: true })
  return pub.keystore
}

module.exports = {
  create
}
