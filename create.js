'use strict'

const debug = require('debug')('ara-filesystem:create')
const { blake2b, keyPair } = require('ara-crypto')
const { createCFS } = require('cfsnet/create')
const { toHex } = require('ara-identity/util')
const { secrets } = require('ara-network')
const fs = require('fs')
const aid = require('./aid')
const path = require('path')
const pify = require('pify')
const os = require('os')

const kArchiverKey = 'archiver'
const kResolverKey = 'resolver'
const kRootDir = os.homedir()
const kIdentitiesDir = path.join(kRootDir, '.ara', 'identities')

/**
 * Creates an AFS with the given Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function create(did = '') {

  if (!did) {
    try {
      await pify(fs.access)(kIdentitiesDir)
      const identities = await pify(fs.readdir)(kIdentitiesDir)
      did = await aid.getLocalIdentity({ dir: kIdentitiesDir, identities })
    } catch (err) { debug(err.stack || err) }
  }

  if ('string' != typeof did) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  const ownerDdo = await aid.resolve(did)
  debug(ownerDdo)
  const identity = await aid.create(did)

  let keystore = (await loadSecrets(kArchiverKey)).keystore
  await aid.archive(identity, { key: kArchiverKey, keystore })

  keystore = (await loadSecrets(kResolverKey)).keystore
  const { publicKey, secretKey } = identity
  const afsDid = publicKey.toString('hex')
  const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore })
  debug(afsDdo)

  const seed = blake2b(secretKey)
  const kp = keyPair(seed)
  const id = toHex(kp.publicKey)

  let afs
  try {
    // create AFS using identity as keypair
    afs = await createCFS({ id, key: kp.publicKey, secretKey: kp.secretKey })
  } catch (err) { debug(err.stack || err) }

  // clear buffers
  kp.publicKey.fill(0)
  kp.secretKey.fill(0)

}

async function loadSecrets(key) {
  const doc = await secrets.load({ key, public: true })
  return doc.public
}

module.exports = {
  create
}
