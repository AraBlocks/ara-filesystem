const debug = require('debug')('ara-filesystem:publish')
const Web3 = require('web3')
const { web3 } = require('ara-context')()
const contract = require('truffle-contract')
const Ownership = contract(require('./build/contracts/Ownership.json'))

Ownership.setProvider(web3.currentProvider)

// TODO(cckelly): change name to ownership.js?
// TODO(cckelly): ava tests
// TODO(cckelly): truffle tests

async function publish({
	identity = '',
	root = '',
	signature = ''
} = {}) {

	if (null == identity || 'string' !== typeof identity) {
		throw new TypeError('ara-filesystem.publish: Identity must be non-empty string.')
	}

	if (null == root || 'string' !== typeof root) {
		throw new TypeError('ara-filesystem.publish: Root must be non-empty string.')
	}

	if (null == signature || 'string' !== typeof signature) {
		throw new TypeError('ara-filesystem.publish: Signature must be non-empty string.')
	}

	const deployed = await Ownership.deployed()

	const identityBuf = Buffer.from(identity)
	const rootBuf = Buffer.from(root)
	const sigBuf = Buffer.from(signature)

	deployed.publish(identityBuf, rootBuf, sigBuf)
}

async function resolve({identity = ''} = {}) {

	if (identity == null || 'string' !== typeof identity) {
		throw new TypeError('ara-filesystem.public: Identity must be non-empty string')
	}

	const deployed = await Ownership.deployed()
	const identityBuf = Buffer.from(identity)
	return deployed.resolve.call(identityBuf)
}

module.exports = {
	publish,
	resolve
} 

 