const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const debug = require('debug')('ara-filesystem:aid')
const context = require('ara-context')()
const hasDIDMethod = require('has-did-method')
const { secret } = require('./rc')()
const util = require('ara-util')
const aid = require('ara-identity')

const { normalize } = util

const {
  kKeyLength,
  kAidPrefix,
  kOwnerSuffix,
  kArchiverSecret,
  kResolverSecret,
  kArchiverRemote,
  kResolverRemote
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
    ? [{ id: 'metadata', value: metadataPublicKey }]
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
      secret: opts.secret || kArchiverSecret,
      name: opts.name || kArchiverRemote,
      keyring: opts.keyring || secret.archiver
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

  did = normalize(did)
  did = `${kAidPrefix}${did}`

  let result
  try {
    opts = {
      secret: opts.secret || kResolverSecret,
      name: opts.name || kResolverRemote,
      keyring: opts.keyring || secret.resolver
    }
    result = await aid.resolve(did, opts)
  } catch (err) {
    throw err
  }

  return result
}

/**
 * Validate a Ara Identity. Wraps ara-util.validate.
 * @param {Object} opts 
 */
async function validate(opts){
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be of type object.')
  }

  if (!opts.keyringOpts || 'object' !== typeof opts.keyringOpts){
    opts.keyringOpts = {
      secret: kResolverSecret,
      name: kResolverRemote,
      keyring: secret.resolver
    }
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
