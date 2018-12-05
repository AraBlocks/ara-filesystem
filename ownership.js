const { writeIdentity } = require('ara-identity/util')
const passGenerator = require('generate-password')
const { METADATA_SUFFIX } = require('./constants')
const { createIdentity } = require('./create')
const { archive } = require('ara-identity')

const {
  getDocumentOwner,
  validate
} = require('ara-util')

const {
  approveOwnershipTransfer,
  revokeOwnershipRequest,
  requestOwnership,
} = require('ara-contracts/ownership')

const PASSWORD_LENGTH = 12

/**
 * Estimates the gas cost for requesting ownership.
 * @param  {Object}
 * @return {String}
 */
async function estimateRequestGasCost(opts) {
  return request(Object.assign(opts, { estimate: true }))
}

/**
 * Estimates the gas cost for revoking an ownership request.
 * @param  {Object} opts
 * @return {String}
 */
async function estimateRevokeGasCost(opts) {
  return revokeRequest(Object.assign(opts, { estimate: true }))
}

/**
 * Estimates the gas cost for approving an ownership transfer.
 * @param  {Object} opts
 * @return {String}
 */
async function estimateApproveGasCost(opts) {
  return approveTransfer(Object.assign(opts, { estimate: true }))
}

/**
 * Requests ownership of an AFS.
 * @param  {Object} opts
 * @param  {String} opts.requesterDid
 * @param  {String} opts.contentDid
 * @param  {String} opts.password
 * @param  {String} [opts.estimate]
 * @throws {Error|TypeError}
 * @return {Object}
 */
async function request(opts) {
  return requestOwnership(opts)
}

/**
 * Revokes a previous ownership request of an AFS.
 * @param  {Object} opts
 * @param  {String} opts.requesterDid
 * @param  {String} opts.contentDid
 * @param  {String} opts.password
 * @param  {String} [opts.estimate]
 * @throws {Error|TypeError}
 * @return {Object}
 */
async function revokeRequest(opts) {
  return revokeOwnershipRequest(opts)
}

/**
 * Approves and transfers an ownership request.
 * @param  {Object} opts
 * @param  {String} opts.newOwnerDid
 * @param  {String} opts.mnemonic
 * @param  {String} opts.did
 * @param  {String} opts.password
 * @param  {Boolean} [opts.estimate]
 * @throws {Error|TypeError}
 * @return {String|Object}
 */
async function approveTransfer(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object')
  } else if (!opts.mnemonic || 'string' !== typeof opts.mnemonic) {
    throw new TypeError('Mnemonic must be non-empty string')
  } else if (!opts.newOwnerDid || 'string' !== typeof opts.newOwnerDid) {
    throw new TypeError('New owner DID must be non-empty string')
  } else if (!opts.contentDid || 'string' !== typeof opts.contentDid) {
    throw new TypeError('AFS DID must be non-empty string')
  } else if (!opts.password || 'string' !== typeof opts.password) {
    throw new TypeError('Password must be non-empty string')
  } else if (opts.estimate && 'boolean' !== typeof opts.estimate) {
    throw new TypeError('Estimate must be of type boolean')
  }

  const {
    keyringOpts = {},
    newOwnerDid,
    contentDid,
    mnemonic,
    password,
    estimate,
  } = opts

  let result
  let randomPassword
  try {
    const identity = await validate({ did: contentDid, password, keyringOpts })
    const { ddo } = identity
    const metadataPublicKey = _getMetadataPublicKey(ddo)

    randomPassword = passGenerator.generate({ length: PASSWORD_LENGTH, numbers: true })
    const newIdentity = await createIdentity({
      mnemonic, owner: newOwnerDid, password: randomPassword, metadataPublicKey
    })
    console.log(newIdentity)
    const { publicKey } = newIdentity
    if (identity.did !== publicKey.toString('hex')) {
      throw new Error('Mnemonic is incorrect, please confirm it is the AFS owner\'s mnemonic.')
    }

    result = await approveOwnershipTransfer(opts)
    if (!estimate && result.status) {
      await _archiveNewIdentity(newIdentity)
    } else {
      return result
    }
  } catch (err) {
    throw err
  }

  return {
    receipt: result,
    password: randomPassword
  }
}

/**
 * Claims a transferred ownership, updating
 * the password used to encrypt the keystore.
 * @param  {Object} opts
 * @param  {String} opts.currentPassword
 * @param  {String} opts.newPassword
 * @param  {String} opts.contentDid
 * @param  {String} opts.Mnemonic
 * @throws {Error|TypeError}
 */
async function claim(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object')
  } else if (!opts.currentPassword || 'string' !== typeof opts.currentPassword) {
    throw new TypeError('Expecting non-empty string for current password')
  } else if (!opts.newPassword || 'string' !== typeof opts.newPassword) {
    throw new TypeError('Expecting non-empty string for new password')
  } else if (!opts.contentDid || 'string' !== typeof opts.contentDid) {
    throw new TypeError('Expecting DID of content to claim')
  } else if (!opts.mnemonic || 'string' !== typeof opts.mnemonic) {
    throw new TypeError('Expecting AFS mnemonic as string')
  }

  const {
    keyringOpts = {},
    currentPassword,
    newPassword,
    contentDid,
    mnemonic
  } = opts

  try {
    const { ddo } = await validate({ did: contentDid, password: currentPassword, keyringOpts })
    const owner = getDocumentOwner(ddo, true)
    const metadataPublicKey = _getMetadataPublicKey(ddo)
    const claimedIdentity = await createIdentity({
      mnemonic, owner, password: newPassword, metadataPublicKey
    })
    await _archiveNewIdentity(claimedIdentity)
  } catch (err) {
    throw err
  }
}

async function _archiveNewIdentity(identity) {
  await archive(identity, {})
  await writeIdentity(identity)
}

// expose in ara-util if this functionality is needed elsewhere
// cckelly
function _getMetadataPublicKey(ddo) {
  const result = ddo.publicKey.find(({ id }) => id.includes(METADATA_SUFFIX))
  if (!result) {
    throw new Error('Could not parse DDO, please make sure the provided DIDs are correct.')
  }
  const { publicKeyHex } = result
  return publicKeyHex
}

module.exports = {
  estimateRequestGasCost,
  estimateApproveGasCost,
  estimateRevokeGasCost,
  approveTransfer,
  revokeRequest,
  request,
  claim
}
