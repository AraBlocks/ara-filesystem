const { create } = require('ara-identity')
const aid = require('./aid')

const {
  approveOwnershipTransfer,
  revokeOwnershipRequest,
  requestOwnership,
} = require('ara-contracts/commerce')

async function request(opts) {
  return requestOwnership(opts)
}

async function revokeRequest(opts) {
  return revokeRequest(opts)
}

async function approveTransfer(opts) {
  if (!opts.mnemonic || 'string' !== typeof opts.mnemonic) {
    throw new TypeError('Mnemonic must be non-empty string')
  }

  try {
    await approveOwnershipTransfer(opts)
  } catch (err) {
    throw err
  }

  const { mnemonic } = opts
  // TODO recreate AFS DDO
}

// void async function main() {
//   try {
//     await transfer({
//       ownerDid: 'did:ara:8a98c8305035dcbb1e8fa0826965200269e232e45ac572d26a45db9581986e67',
//       password: 'pass',
//       contentDid: 'did:ara:cdbf8ebd3963ee178e5b80047c73dc1d9b48a3778d28dafd6cc272b25926d088',
//       newOwnerDid: 'did:ara:cebc55ee22134f2cabdfeb64364d4312ffbb3e887362f613290e6d06bc84bab3',
//       estimate: true
//     })
//   } catch (err) {
//     console.log(err)
//     throw err
//   }
// }()

module.exports = {
  approveTransfer,
  revokeRequest,
  request
}
