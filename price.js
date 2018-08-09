const { kAFSAddress } = require('ara-contracts/constants')
const { abi } = require('ara-contracts/build/contracts/AFS.json')
const { kAFSAddress } = require('ara-contracts/constants')
const debug = require('debug')('ara-filesystem:price')

const {
  proxyExists,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  tx,
  call,
  account,
  contract
} = require('ara-web3')

const {
  validate,
  getDocumentOwner
} = require('ara-util')

async function estimateSetPriceGasCost({
  did = '',
  password = '',
  price = 0
} = {}) {
  let ddo
  try {
    ({ did, ddo } = await validate({ did, password, label: 'price' }))
  } catch (err) {
    throw err
  }

  if (0 > price || 'number' !== typeof price) {
    throw new TypeError('Price should be 0 or positive whole number.')
  }

  if (!(await proxyExists(did))) {
    throw new Error('ara-filesystem.price: This content does not have a valid proxy contract')
  }

  const proxy = await getProxyAddress(did)

  const owner = getDocumentOwner(ddo, true)
  const acct = await account.load({ did: owner, password })

  let cost
  try {
    const transaction = await tx.create({
      account: acct,
      to: proxy,
      data: {
        abi,
        name: 'setPrice',
        values: [
          price
        ]
      }
    })

    return tx.estimateCost(transaction)
  } catch (err) {
    throw new Error(`This AFS has not been committed to the network, 
      please commit before trying to set a price.`)
  }
}

async function setPrice({
  did = '',
  password = '',
  price = 0,
} = {}) {
  let ddo
  try {
    ({ did, ddo } = await validate({ did, password, label: 'price' }))
  } catch (err) {
    throw err
  }

  if (0 > price || 'number' !== typeof price) {
    throw new TypeError('Price should be 0 or positive whole number.')
  }

  if (!(await proxyExists(did))) {
    throw new Error('ara-filesystem.price: This content does not have a valid proxy contract')
  }

  const proxy = await getProxyAddress(did)

  const owner = getDocumentOwner(ddo, true)
  const acct = await account.load({ did: owner, password })

  try {
    const transaction = await tx.create({
      account: acct,
      to: proxy,
      data: {
        abi,
        name: 'setPrice',
        values: [
          price
        ]
      }
    })
    await tx.sendSignedTransaction(transaction)
  } catch (err) {
    throw new Error(`This AFS has not been committed to the network, 
      please commit before trying to set a price.`)
  }

  debug('price for', did, 'set to', price, 'ARA')
}

async function getPrice({
  did = ''
} = {}) {
  if (!(await proxyExists(did))) {
    throw new Error('ara-filesystem.price: This content does not have a valid proxy contract')
  }

  const proxy = await getProxyAddress(contentDid)

  const result = await call({
    abi: afsAbi,
    address: proxy,
    functionName: 'price_'
  })
  debug('price for %s: %d', did, result)
  return result
}

module.exports = {
  estimateSetPriceGasCost,
  setPrice,
  getPrice
}
