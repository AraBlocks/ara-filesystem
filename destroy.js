const { abi } = require('ara-contracts/build/contracts/AFS.json')
const { kAFSAddress } = require('ara-contracts/constants')
const debug = require('debug')('ara-filesystem:destroy')
const account = require('ara-web3/account')
const tx = require('ara-web3/tx')
const { access } = require('fs')
const rimraf = require('rimraf')
const pify = require('pify')
const { web3 } = require('ara-context')()
const { getAFSOwnerIdentity, validate, getDocumentOwner } = require('ara-util')
const { abi } = require('ara-contracts/build/contracts/AFS.json')
const { kAFSAddress } = require('ara-contracts/constants')
const { contract } = require('ara-web3')
const rc = require('./rc')()

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
  let ddo
  try {
    ({ did, ddo } = await validate({ did, password, label: 'destroy' }))
  } catch (err) {
    throw err
  }

  if (!mnemonic || 'string' !== typeof mnemonic) {
    throw new TypeError('Expecting non-empty string for mnemonic')
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
    throw new Error('Mnemonic is incorrect')
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

  const owner = getDocumentOwner(ddo, true)
  const acct = await account.load({ did: owner, password })

  try {
    const transaction = await tx.create({
      account: acct,
      to: kAFSAddress,
      data: {
        abi,
        name: 'unlist'
      }
    })
    await tx.sendSignedTransaction(transaction)
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = {
  destroy
}
