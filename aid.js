const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const { MissingOptionError } = require('ara-util/errors')
const hasDIDMethod = require('has-did-method')
const context = require('ara-context')()
const debug = require('debug')('ara-filesystem:aid')
const util = require('ara-util')
const aid = require('ara-identity')
const rc = require('./rc')()

const {
  kKeyLength,
  kAidPrefix,
  kOwnerSuffix
} = require('./constants')

async function create({
  password = '',
  owner = '',
  metadataPublicKey = '',
  mnemonic
} = {}) {
  if (null == password || 'string' !== typeof password) {
    throw new TypeError('Expecting password to be non-empty string.')
  }

  if (null == owner || 'string' !== typeof owner) {
    throw new TypeError('Expecting non-empty string.')
  }

  if ((hasDIDMethod(owner) && kKeyLength !== owner.slice(kAidPrefix.length).length)
    || (!hasDIDMethod(owner) && kKeyLength !== owner.length)) {
    throw new TypeError('Owner identifier must be 64 chars.')
  }

  owner += kOwnerSuffix

  const publicKeys = metadataPublicKey
    ? [ { id: 'metadata', value: metadataPublicKey } ]
    : null

  let identity
  try {
    const ddo = {
      authentication: {
        type: kEd25519VerificationKey2018,
        publicKey: owner
      },
      publicKeys
    }
    identity = await aid.create({
      context,
      password,
      ddo,
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
async function archive(identity, opts = {}) {
  if (!identity || 'object' !== typeof identity) {
    throw new TypeError('Identity to archive must be valid identity object')
  } else if (opts && 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be of type object.')
  }

  try {
    opts = {
      secret: opts.secret,
      network: opts.network || rc.network.archiver,
      keyring: opts.keyring || rc.network.identity.keyring
    }
    await aid.archive(identity, opts)
  } catch (err) {
    throw err
  }
}

/**
 * Resolve an Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function resolve(did, opts = {}) {
  if (!did || null === did || 'string' !== typeof did) {
    throw new TypeError('DID to resolve must be non-empty string.')
  } else if (opts && 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be of type object.')
  }

  did = util.normalize(did)
  did = `${kAidPrefix}${did}`

  let result
  try {
    opts = {
      secret: opts.secret,
      network: opts.network || rc.network.resolver,
      keyring: opts.keyring || rc.network.identity.keyring
    }
    result = await aid.resolve(did, opts)
  } catch (err) {
    throw err
  }

  return result
}

/**
 * Validate an Ara Identity. Wraps ara-util.validate.
 * @param {Object} opts
 * @return {Object}
 * @throws {Error,TypeError}
 */
async function validate(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be of type object.')
  }

  let result
  try {
    result = await util.validate(opts)
  } catch (err) {
    throw err
  }

  return result
}

module.exports = {
  archive,
  create,
  resolve,
  validate
}
