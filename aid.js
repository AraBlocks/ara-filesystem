const debug = require('debug')('ara-filesystem:aid')
const aid = require('ara-identity')
const crypto = require('ara-crypto')
const context = require('ara-context')()
const { kAidPrefix, kOwnerSuffix, kDidPrefix, kKeyLength } = require('./constants')
const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')

async function create(seed, publicKey) {
  if (null == publicKey || 'string' !== typeof publicKey) {
    throw new TypeError('ara-filesystem.aid: Expecting non-empty string.')
  }

  if ((hasDIDMethod(publicKey) && kKeyLength !== publicKey.slice(kDidPrefix.length).length)
    || kKeyLength !== publicKey.length) {
    throw new TypeError('ara-filesystem.aid: Identifier must be 64 chars')
  }

  if (null == seed || 'string' !== typeof seed) {
    throw new Error('ara-filesystem.aid: Expecting seed of type string.')
  }

  publicKey += kOwnerSuffix

  const password = crypto.blake2b(Buffer.from(seed)).toString()
  let identity
  try {
    const did = { authentication: { authenticationType: kEd25519VerificationKey2018, authenticationKey: publicKey } }
    identity = await aid.create({ context, password, did })
  } catch (err) { debug(err.stack || err) }
  return identity
}

/**
 * Archive a given AID
 * @param  {string} identity
 * @param  {Object} opts
 * @return {void}
 */
async function archive(identity, opts) {
  try {
    await aid.archive(identity, opts)
  } catch (err) { debug(err.stack || err) }
}

/**
 * Resolve an Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function resolve(did, opts = {}) {
  const prefix = did.substring(0, kAidPrefix.length)
  if (prefix !== kAidPrefix) {
    did = kAidPrefix + did
  }

  if (!opts.cache) {
    opts = Object.assign(opts, { cache: true })
  }

  let result
  try {
    result = await aid.resolve(did, opts)
  } catch (err) { debug(err.stack || err) }

  return result
}

/**
 * Checks if given key has DID method prefix ('did:ara:')
 * @param  {string}  key
 * @return {Boolean}
 */
// TODO(cckelly): move all validation for DID to util.js
function hasDIDMethod(key) {
  return kDidPrefix === key.slice(0, kDidPrefix.length)
}

module.exports = {
  archive,
  create,
  resolve,
  hasDIDMethod
}
