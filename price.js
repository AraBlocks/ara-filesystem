const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:price')
const { kAidPrefix } = require('./constants')
const { token, price } = require('ara-contracts')
const util = require('util')

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

module.exports = {
  estimateSetPriceGasCost: util.deprecate(async (opts) => { return price.estimateSetPriceGasCost(opts) }, 'afs.estimateSetPriceGasCost() is deprecated. Use act.estimateSetPriceGasCost() instead.'),
  removePriceTier: util.deprecate(async (opts) => { return price.removePriceTier(opts) }, 'afs.removePriceTier() is deprecated. Use act.removePriceTier() instead.'),
  setPrice: util.deprecate(async (opts) => { return price.setPrice(opts) }, 'afs.setPrice() is deprecated. Use act.setPrice() instead.'),
  getPrice: util.deprecate(async (opts) => { return price.getPrice(opts) }, 'afs.getPrice() is deprecated. Use act.getPrice() instead.')
}
