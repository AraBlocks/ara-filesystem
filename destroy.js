const debug = require('debug')('ara-filesystem:destroy')
const { destroyCFS } = require('cfsnet/destroy')
const { validate } = require('./util')
const { createAFSKeyPath } = require('./key-path')
const { access } = require('fs')
const { basename, resolve } = require('path')
const rimraf = require('rimraf')
const pify = require('pify')

const kNodesDir = 'nodes'

async function destroy({
  did = '',
  mnemonic = '',
  password = ''
} = {}) {
  await validate(did, password, 'destroy')
  let path = createAFSKeyPath(did)
  const hash = basename(path)

  try {
    // delete AFS on disk
    await pify(access)(path)
    await pify(rimraf)(path)

    // destroy AFS identity

  } catch (err) {
    throw new Error(err)
  }

  path = resolve(path.replace(hash, ''), kNodesDir, hash)

  // delete AFS toilet db file
  try {
    await pify(access)(path)
    await pify(rimraf)(path)
  } catch (err) {
    debug('db file at %s does not exist', path)
  }

  // destroy AFS identity
  try {

  } catch (err) {
    throw new Error()
  }
}

module.exports = {
  destroy
}
