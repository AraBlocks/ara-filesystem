const debug = require('debug')('ara-filesystem:destroy')
const { access } = require('fs')
const rc = require('./rc')()
const rimraf = require('rimraf')
const pify = require('pify')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Storage.json')
const { kStorageAddress } = require('./constants')
const { getAFSOwnerIdentity, validate, hashDID } = require('ara-util')

const {
  createAFSKeyPath,
  createIdentityKeyPath
} = require('./key-path')

const {
  basename,
  resolve: resolvePath
} = require('path')

async function destroy({
  did = '',
  mnemonic = '',
  password = ''
} = {}) {
  try {
    ({ did } = await validate({ did, password, label: 'destroy' }))
  } catch (err) {
    throw err
  }

  if (!mnemonic || 'string' !== typeof mnemonic) {
    throw new TypeError('Expecting non-empty string for mnemonic.')
  }

  mnemonic = mnemonic.trim()

  let path

  try {
    // destroy AFS identity
    const afsIdentity = await getAFSOwnerIdentity({ did, mnemonic, password })
    path = createIdentityKeyPath(afsIdentity)
    await pify(access)(path)
    await pify(rimraf)(path)

    // delete AFS on disk
    path = createAFSKeyPath(did)
    await pify(access)(path)
    await pify(rimraf)(path)
  } catch (err) {
    throw new Error('Mnemonic is incorrect.')
  }

  const { store } = rc.afs.archive
  path = resolvePath(store, basename(path))

  // delete AFS toilet db file
  try {
    await pify(access)(path)
    await pify(rimraf)(path)
  } catch (err) {
    debug('db file at %s does not exist', path)
  }

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const accounts = await web3.eth.getAccounts()
  const hIdentity = hashDID(did)

  try {
    // mark blockchain buffers invalid
    await deployed.methods.del(hIdentity).send({ from: accounts[0], gas: 500000 })
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  destroy
}
