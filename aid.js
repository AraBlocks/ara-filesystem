const debug = require('debug')('ara-filesystem:aid')
const aid = require('ara-identity')
const crypto = require('ara-crypto')
const context = require('ara-context')()
const { AID_PREFIX, KEY_OWNER_SUFFIX } = require('./constants')
const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')

async function create(seed, publicKey) {
  if (null == publicKey || 'string' !== typeof publicKey) {
    throw new Error('ara-filesystem.aid: Expecting non-empty string.')
  }

  if (null == seed || 'string' !== typeof seed) {
    throw new Error('ara-filesystem.aid: Expecting seed of type string.')
  }

  publicKey += KEY_OWNER_SUFFIX

  const password = crypto.blake2b(Buffer.from(seed)).toString()
  let identity
  try {
    const did = { authentication: { type: kEd25519VerificationKey2018, publicKey } }
    identity = await aid.create({ context, password, did })
  } catch (err) { debug(err.stack || err) }
  return identity
}

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
  const prefix = did.substring(0, AID_PREFIX.length)
  if (prefix !== AID_PREFIX) {
    did = AID_PREFIX + did
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

module.exports = {
  archive,
  create,
  resolve
}
