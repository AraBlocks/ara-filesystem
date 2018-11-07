const { unarchive } = require('./unarchive')
const ownership = require('./ownership')
const { destroy } = require('./destroy')
const { create } = require('./create')
const { remove } = require('./remove')
const metadata = require('./metadata')
const { deploy } = require('./deploy')
const { commit } = require('./commit')
const { add } = require('./add')

const { setPrice, getPrice } = require('./price')

module.exports = {
  unarchive,
  ownership,
  setPrice,
  getPrice,
  metadata,
  destroy,
  deploy,
  create,
  remove,
  commit,
  add,
}
