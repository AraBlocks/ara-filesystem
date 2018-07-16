const debug = require('debug')('ara-filesystem:destroy')
const { destroyCFS } = require('cfsnet/destroy')
const { validate } = require('./util')
const { createAFSKeyPath } = require('./key-path')
const fs = require('fs')
const rimraf = require('rimraf')
const pify = require('pify')

async function destroy({
  did = '',
  password = ''
} = {}) {
  await validate(did, password, 'destroy')
  const path = createAFSKeyPath(did)

  try {
    await pify(fs.access)(path)
    await pify(rimraf)(path)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  destroy
}
