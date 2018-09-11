const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:price')
const { kAidPrefix } = require('./constants')

const {
  proxyExists,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  validate,
  getDocumentOwner,
  web3: {
    tx,
    call,
    account
  }
} = require('ara-util')

/**
 * Estimates the gas cost setting the price
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {Number}   opts.price
 */
async function estimateSetPriceGasCost(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if ('number' !== typeof opts.price || opts.price < 0) {
    throw new TypeError('Expecting whole number price.')
  }

  let { did } = opts
  const { password, price } = opts
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
    throw new Error('This content does not have a valid proxy contract')
  }

  const proxy = await getProxyAddress(did)

  let owner = getDocumentOwner(ddo, true)
  owner = `${kAidPrefix}${owner}`
  const acct = await account.load({ did: owner, password })

  try {
    const transaction = await tx.create({
      account: acct,
      to: proxy,
      data: {
        abi,
        functionName: 'setPrice',
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

/**
 * Sets the price of the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {Number}   opts.price
 */
async function setPrice(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if ('number' !== typeof opts.price || opts.price <= 0) {
    throw new TypeError('Expecting whole number price.')
  }

  let { did } = opts
  const { password, price } = opts
  let ddo
  try {
    ({ did, ddo } = await validate({ did, password, label: 'price' }))
  } catch (err) {
    throw err
  }

  if (!(await proxyExists(did))) {
    throw new Error('This content does not have a valid proxy contract')
  }

  const proxy = await getProxyAddress(did)

  let owner = getDocumentOwner(ddo, true)
  owner = `${kAidPrefix}${owner}`
  const acct = await account.load({ did: owner, password })

  try {
    const transaction = await tx.create({
      account: acct,
      to: proxy,
      data: {
        abi,
        functionName: 'setPrice',
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

/**
 * Gets the price of the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @return {Number}
 */
async function getPrice(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  }

  const { did } = opts

  if (!(await proxyExists(did))) {
    throw new Error('This content does not have a valid proxy contract')
  }

  const proxy = await getProxyAddress(did)

  const result = await call({
    abi,
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
