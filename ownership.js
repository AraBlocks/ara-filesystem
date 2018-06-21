const debug = require('debug')('ara-filesystem:publish')
const { blake2b } = require('ara-crypto')
const { web3 } = require('ara-context')()
const { kLocalAccountAddress, kOwnershipContractAddress } = require('./addresses')
const ownershipArtifacts = require('./build/contracts/Ownership.json')

async function publish({
  identity = '',
  root = '',
  signature = ''
} = {}, onpublished) {
  if (!identity || 'string' !== typeof identity) {
    throw new TypeError('ara-filesystem.publish: Identity must be non-empty string.')
  }

  if (!root || 'string' !== typeof root) {
    throw new TypeError('ara-filesystem.publish: Root must be non-empty string.')
  }

  if (!signature || 'string' !== typeof signature) {
    throw new TypeError('ara-filesystem.publish: Signature must be non-empty string.')
  }

  const deployed = new web3.eth.Contract(ownershipArtifacts.abi, kOwnershipContractAddress)
  const hIdentity = _hashIdentity(identity)
  const rootBuf = web3.utils.asciiToHex(root)
  const sigBuf = web3.utils.asciiToHex(signature)

  deployed.events.Published(onpublished)

  const opts = { from: kLocalAccountAddress }
  await deployed.methods.publish(hIdentity, rootBuf, sigBuf).send(opts)
    .on('receipt', onreceipt)

  function onreceipt(receipt) {
    debug('ara-filesystem:publish: Transaction receipt received', receipt)
  }
}

async function resolve(identity = '') {
  if (!identity || 'string' !== typeof identity) {
    throw new TypeError('ara-filesystem.resolve: Identity must be non-empty string')
  }

  const hIdentity = _hashIdentity(identity)

  const deployed = new web3.eth.Contract(ownershipArtifacts.abi, kOwnershipContractAddress)
  const result = await deployed.methods.resolve(hIdentity).call()

  return {
    root: _hexToAscii(result.root),
    signature: _hexToAscii(result.signature)
  }
}

function _hexToAscii(h) {
  return h ? web3.utils.hexToAscii(h) : ''
}

function _hashIdentity(identity) {
  return blake2b(Buffer.from(identity)).toString('hex')
}

module.exports = {
  publish,
  resolve
}
