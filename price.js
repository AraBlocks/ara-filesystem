const { abi } = require('ara-contracts/build/contracts/AFS.json')
const { kAFSAddress } = require('ara-contracts/constants')
const debug = require('debug')('ara-filesystem:price')
const contract = require('ara-web3/contract')
const account = require('ara-web3/account')
const tx = require('ara-web3/tx')

const {
  validate,
  getDocumentOwner
} = require('./util')

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
    throw new TypeError('Price should be 0 or positive whole number')
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
  let ddo
  try {
    ({ did, ddo } = await validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  if (0 > price || 'number' !== typeof price) {
    throw new TypeError('Price should be 0 or positive whole number')
  }

  const owner = getDocumentOwner(ddo, true)
  const acct = await account.load({ did: owner, password })

  try {
    const transaction = tx.create({
      account: acct,
      to: kAFSAddress,
      data: {
        abi,
        name: 'setPrice',
        values: [
          price
        ]
      }
    })
    tx.sendSignedTransaction(transaction)
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
  try {
    ({ did } = await validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  const deployed = contract.get(abi, kAFSAddress)
  const result = await deployed.methods.price_().call()
  debug('price for %s: %d', did, result)
  return result
}

module.exports = {
  estimateSetPriceGasCost,
  setPrice,
  getPrice
}
