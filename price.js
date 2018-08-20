const debug = require('debug')('ara-filesystem:price')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Price.json')
const { contract } = require('ara-web3')

const {
  validate,
  hashDID
} = require('ara-util')

const {
  kPriceAddress,
  kStorageAddress
} = require('./constants')

async function estimateSetPriceGasCost({
  did = '',
  password = '',
  price = 0
} = {}) {
  try {
    ({ did } = await validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  if (0 > price || 'number' !== typeof price) {
    throw new TypeError('Price should be 0 or positive whole number.')
  }

  let cost
  try {
    const hIdentity = hashDID(did)
    const deployed = contract.get(abi, kPriceAddress)
    cost = await deployed.methods
      .setPrice(hIdentity, price, kStorageAddress)
      .estimateGas({ gas: 500000 })
  } catch (err) {
    throw new Error(`This AFS has not been committed to the network, 
      please commit before trying to set a price.`)
  }
  return cost
}

async function setPrice({
  did = '',
  password = '',
  price = 0,
} = {}) {
  try {
    ({ did } = await validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  if (0 > price || 'number' !== typeof price) {
    throw new TypeError('Price should be 0 or positive whole number.')
  }

  const accounts = await web3.eth.getAccounts()
  const hIdentity = hashDID(did)
  const deployed = contract.get(abi, kPriceAddress)

  try {
    await deployed.methods.setPrice(hIdentity, price, kStorageAddress).send({
      from: accounts[0],
      gas: 500000
    })
  } catch (err) {
    throw new Error(`This AFS has not been committed to the network, 
      please commit before trying to set a price.`)
  }

  debug('price for', did, 'set to', price, 'ARA')
}

async function getPrice({
  did = ''
} = {}) {
  try {
    ({ did } = await validate({ did, label: 'commit' }))
  } catch (err) {
    throw err
  }

  const hIdentity = hashDID(did)
  const deployed = new web3.eth.Contract(abi, kPriceAddress)
  const result = await deployed.methods.getPrice(hIdentity).call()
  debug('price for %s: %d', hIdentity, result)
  return result
}

module.exports = {
  estimateSetPriceGasCost,
  setPrice,
  getPrice
}
