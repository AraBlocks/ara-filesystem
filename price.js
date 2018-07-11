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
  isCorrectPassword
} = require('./util')

async function setPrice({
  did = '',
  password = '',
  price = 0,
} = {}) {
  await validate(did, password)

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

async function validate(did, password) {
  if (!did || 'string' !== typeof did) {
    throw new TypeError('Expecting valid DID')
  }

  if (!password || 'string' !== typeof password) {
    throw new TypeError('Expecting non-empty string for password')
  }

  if (!(await isCorrectPassword({ did, password }))) {
    throw new Error('Incorrect password')
  }
}

module.exports = {
  setPrice,
  getPrice
}
