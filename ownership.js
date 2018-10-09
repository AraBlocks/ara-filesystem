const { writeIdentity } = require('ara-identity/util')
const passGenerator = require('generate-password')
const { kMetadataSuffix } = require('./constants')
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
} = require('ara-contracts/commerce')

const PASSWORD_LENGTH = 12

async function estimateRequestGasCost(opts) {
  opts = Object.assign(opts, { estimate: true })
  return request(opts)
}

async function estimateRevokeGasCost(opts) {
  opts = Object.assign(opts, { estimate: true })
  return revokeRequest(opts)
}

async function estiamteApproveGasCost(opts) {
  opts = Object.assign(opts, { estimate: true })
  return approveTransfer(opts)
}

async function request(opts) {
  return requestOwnership(opts)
}

async function revokeRequest(opts) {
  return revokeOwnershipRequest(opts)
}

async function approveTransfer(opts) {
  if (!opts.mnemonic || 'string' !== typeof opts.mnemonic) {
    throw new TypeError('Mnemonic must be non-empty string')
  }

  const {
    newOwnerDid,
    keyringOpts,
    mnemonic,
    password,
    estimate,
    did
  } = opts

  let result
  let randomPassword
  try {
    const identity = await validate({ did, password, keyringOpts })
    const { ddo } = identity
    const metadataPublicKey = _getMetadataPublicKey(ddo)

    randomPassword = passGenerator.generate({ length: PASSWORD_LENGTH, numbers: true })
    const newIdentity = await createIdentity({
      mnemonic, owner: newOwnerDid, password: randomPassword, metadataPublicKey
    })
    const { publicKey } = newIdentity
    if (identity.did !== publicKey.toString('hex')) {
      throw new Error('Mnemonic is incorrect, please confirm it is the AFS owner\'s mnemonic.')
    }

    result = await approveOwnershipTransfer(opts)
    if (!estimate && result.status) {
      await _archiveNewIdentity(newIdentity)
    }
  } catch (err) {
    throw err
  }

  return {
    receipt: result,
    password: randomPassword
  }
}

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
    currentPassword,
    newPassword,
    keyringOpts,
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
  const result = ddo.publicKey.find(({ id }) => id.includes(kMetadataSuffix))
  if (!result) {
    throw new Error('Could not parse DDO, please make sure the provided DIDs are correct.')
  }
  const { publicKeyHex } = result
  return publicKeyHex
}

module.exports = {
  estimateRequestGasCost,
  estiamteApproveGasCost,
  estimateRevokeGasCost,
  approveTransfer,
  revokeRequest,
  request,
  claim
}
