const { kAFSAddress } = require('ara-contracts/constants')
const { abi } = require('./build/contracts/Price.json')
const debug = require('debug')('ara-filesystem:price')
const { web3 } = require('ara-context')()
const { contract } = require('ara-web3')
const { validate } = require('ara-util')

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
    const deployed = contract.get(abi, kAFSAddress)
    cost = await deployed.methods
      .setPrice(price)
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
  const deployed = contract.get(abi, kAFSAddress)

  try {
    await deployed.methods.setPrice(price).send({
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

  const deployed = new contract.get(abi, kAFSAddress)
  const result = await deployed.methods.price_().call()
  debug('price for %s: %d', did, result)
  return result
}

module.exports = {
  estimateSetPriceGasCost,
  setPrice,
  getPrice
}
