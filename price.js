const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:price')
const { AID_PREFIX } = require('./constants')
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
 * Sets the price of the given Ara identity
 * @param {Object}    opts
 * @param {String}    opts.did
 * @param {String}    opts.password
 * @param {String}    opts.afsPassword
 * @param {Number}    opts.price
 * @param {Boolean}   opts.estimate
 * @param {String}    opts.estimateDid
 * @param {Object}    [opts.keyringOpts]
 * @param  {Number}   [opts.gasPrice]
 * @param  {Function} [opts.onhash]
 * @param  {Function} [opts.onreceipt]
 * @param  {Function} [opts.onconfirmation]
 * @param  {Function} [opts.onerror]
 * @param  {Function} [opts.onmined]
 */
async function setPrice(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if (opts.afsPassword && 'string' !== typeof opts.afsPassword) {
    throw TypeError('Expecting non-empty password.')
  } else if ('number' !== typeof opts.price || opts.price < 0) {
    throw new TypeError('Expecting whole number price.')
  } else if (opts.estimate && 'boolean' !== typeof opts.estimate) {
    throw new TypeError('Expecting boolean.')
  } else if (opts.estimateDid && 'string' !== typeof opts.estimateDid) {
    throw new TypeError('Expecting non-empty string.')
  } else if (opts.gasPrice && ('number' !== typeof opts.gasPrice || opts.gasPrice < 0)) {
    throw new TypeError(`Expected 'opts.gasPrice' to be a positive number. Got ${opts.gasPrice}.`)
  }

  let {
    did, estimate, price, afsPassword
  } = opts
  const {
    password,
    keyringOpts,
    estimateDid,
    gasPrice = 0,
    onhash,
    onreceipt,
    onconfirmation,
    onerror,
    onmined
  } = opts

  afsPassword = afsPassword || password

  estimate = estimate || false

  let ddo
  try {
    ({ did, ddo } = await validate({
      did, password: afsPassword, label: 'price', keyringOpts
    }))
  } catch (err) {
    throw err
  }

  if (estimateDid) {
    did = estimate ? estimateDid : did
  }

  const currentPrice = await getPrice({ did })
  if (currentPrice == price && !estimate) {
    throw new Error(`AFS price is already ${price}`)
  }

  if (!(await proxyExists(did))) {
    throw new Error('Proxy doesn\'t exist, please deploy a proxy for this AFS first.')
  }

  const proxy = await getProxyAddress(did)
  let owner = getDocumentOwner(ddo, true)
  owner = `${AID_PREFIX}${owner}`
  const acct = await account.load({ did: owner, password })

  if ('string' !== typeof price) {
    price = price.toString()
  }

  price = token.expandTokenValue(price)

  try {
    const { tx: transaction, ctx } = await tx.create({
      account: acct,
      to: proxy,
      gasPrice,
      data: {
        abi,
        functionName: 'setPrice',
        values: [
          price
        ]
      }
    })

    if (estimate) {
      const cost = tx.estimateCost(transaction)
      ctx.close()
      return cost
    }

    const receipt = await tx.sendSignedTransaction(transaction, {
      onhash,
      onreceipt,
      onconfirmation,
      onerror,
      onmined
    })
    ctx.close()
    return receipt
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
  setPrice,
  getPrice
}
