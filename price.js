const debug = require('debug')('ara-filesystem:price')
const { blake2b } = require('ara-crypto')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Price.json')

const {
  kPriceAddress,
  kStorageAddress
} = require('./constants')

const {
  hashIdentity,
  isCorrectPassword,
  validate
} = require('./util')

async function setPrice({
  did = '',
  password = '',
  price = 0,
} = {}) {
  await validate(did, password, 'price')

  if ('number' !== typeof price) {
    throw new TypeError('Price should be 0 or positive whole number')
  }

  const accounts = await web3.eth.getAccounts()
  const hIdentity = hashIdentity(did)
  const deployed = new web3.eth.Contract(abi, kPriceAddress)

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
  did = '',
  password = ''
} = {}) {
  await validate(did, password)

  const hIdentity = hashIdentity(did)
  const deployed = new web3.eth.Contract(abi, kPriceAddress)
  const result = await deployed.methods.getPrice(hIdentity).call()
  debug('price for %s: %d', hIdentity, result)
  return result
}

module.exports = {
  setPrice,
  getPrice
}