const debug = require('debug')('ara-filesystem:aid')
const aid = require('ara-identity')
const context = require('ara-context')()
const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')

const {
  kAidPrefix,
  kOwnerSuffix,
  kDidPrefix,
  kKeyLength
} = require('./constants')

async function create(seed, publicKey) {
  if (null == publicKey || 'string' !== typeof publicKey) {
    throw new TypeError('ara-filesystem.aid: Expecting non-empty string.')
  }

  const { hasDIDMethod } = require('./util')

  if ((hasDIDMethod(publicKey) && kKeyLength !== publicKey.slice(kAidPrefix.length).length)
    || (!hasDIDMethod(publicKey) && kKeyLength !== publicKey.length)) {
    throw new TypeError('ara-filesystem.aid: Identifier must be 64 chars')
  }

  if (null == seed || 'string' !== typeof seed) {
    throw new Error('ara-filesystem.aid: Expecting seed of type string.')
  }

  publicKey += kOwnerSuffix

  let identity
  try {
    const did = {
      authentication:
      {
        authenticationType: kEd25519VerificationKey2018,
        authenticationKey: publicKey
      }
    }
    identity = await aid.create({ context, password: seed, did })
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
  } catch (err) { throw new Error(err) }
}

/**
 * Resolve an Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function resolve(did, opts = {}) {
  if (!did || null === did || 'string' !== typeof did) {
    throw new TypeError('ara-filesystem.aid: DID to resolve must be non-empty string')
  }

  const { normalize } = require('./util')

  did = normalize(did)
  did = kAidPrefix + did

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
