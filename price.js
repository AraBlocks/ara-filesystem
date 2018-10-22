const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:price')
const { token, price } = require('ara-contracts')
const { kAidPrefix } = require('./constants')
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
  estimateSetPriceGasCost: util.deprecate(async (opts) => { return price.estimateSetPriceGasCost(opts) }, 'estimateSetPriceGasCost() is deprecated. Use estimateSetPriceGasCost() in ara-contracts instead.'),
  removePriceTier: util.deprecate(async (opts) => { return price.removePriceTier(opts) }, 'removePriceTier() is deprecated. Use removePriceTier() in ara-contracts instead.'),
  setPrice: util.deprecate(async (opts) => { return price.setPrice(opts) }, 'setPrice() is deprecated. Use setPrice() in ara-contracts instead.'),
  getPrice: util.deprecate(async (opts) => { return price.getPrice(opts) }, 'getPrice() is deprecated. Use getPrice() in ara-contracts instead.')
}
