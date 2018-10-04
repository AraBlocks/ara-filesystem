const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:price')
const { kAidPrefix } = require('./constants')
const { token } = require('ara-contracts')

const {
  proxyExists,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  getDocumentOwner,
  validate,
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
  } else if ('number' !== typeof opts.price || 0 >= opts.price) {
    throw new TypeError('Expecting whole number price.')
  }

  opts = Object.assign(opts, { estimate: true })
  return setPrice(opts)
}

/**
 * Sets the price of the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {?Object}   opts.keyringOpts
 * @param {Number}   opts.price
 * @param {Boolean}  opts.estimate
 */
async function setPrice(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if ('number' !== typeof opts.price || 0 >= opts.price) {
    throw new TypeError('Expecting whole number price.')
  } else if (opts.estimate && 'boolean' !== typeof opts.estimate) {
    throw new TypeError('Expecting boolean.')
  }

  let {
    did, estimate, price
  } = opts
  const { password, keyringOpts } = opts

  estimate = estimate || false

  let ddo
  try {
    ({ did, ddo } = await validate({
      did, password, label: 'price', keyringOpts
    }))
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

  if ('string' !== typeof price) {
    price = price.toString()
  }

  price = token.expandTokenValue(price)

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

    if (estimate) {
      return tx.estimateCost(transaction)
    }

    return tx.sendSignedTransaction(transaction)
  } catch (err) {
    throw new Error(`This AFS has not been committed to the network, 
      please commit before trying to set a price.`)
  }
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

  return token.constrainTokenValue(result)
}

module.exports = {
  estimateSetPriceGasCost,
  setPrice,
  getPrice
}
