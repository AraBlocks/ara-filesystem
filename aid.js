const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const debug = require('debug')('ara-filesystem:aid')
const context = require('ara-context')()
const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const hasDIDMethod = require('has-did-method')
const { normalize } = require('ara-util')
const aid = require('ara-identity')

const {
  kAidPrefix,
  kOwnerSuffix,
  kKeyLength
} = require('./constants')

async function create({
  password = '',
  owner = '',
  mnemonic
} = {}) {
  if (null == password || 'string' !== typeof password) {
    throw new TypeError('ara-filesystem.aid: Expecting password to be non-empty string.')
  }

  if (null == owner || 'string' !== typeof owner) {
    throw new TypeError('ara-filesystem.aid: Expecting non-empty string.')
  }

  if ((hasDIDMethod(owner) && kKeyLength !== owner.slice(kAidPrefix.length).length)
    || (!hasDIDMethod(owner) && kKeyLength !== owner.length)) {
    throw new TypeError('ara-filesystem.aid: Owner identifier must be 64 chars')
  }

  owner += kOwnerSuffix

  let identity
  try {
    const did = {
      authentication:
      {
        authenticationType: kEd25519VerificationKey2018,
        authenticationKey: owner
      }
    }
    identity = await aid.create({
      context,
      password,
      did,
      mnemonic
    })
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

  did = normalize(did)
  did = kAidPrefix + did

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
