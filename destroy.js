const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:destroy')
const { kAidPrefix } = require('./constants')
const { access } = require('fs')
const rimraf = require('rimraf')
const pify = require('pify')
const rc = require('./rc')()

const {
  proxyExists,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  createAFSKeyPath,
  createIdentityKeyPath
} = require('./key-path')

const {
  validate,
  getDocumentOwner,
  getAFSOwnerIdentity,
  web3: {
    tx,
    account
  }
} = require('ara-util')

const {
  basename,
  resolve: resolvePath
} = require('path')

/**
 * Destroys the AFS with the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {String}   opts.mnemonic
 * @return {Object}
 */
async function destroy(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if ('string' !== typeof opts.mnemonic || !opts.mnemonic) {
    throw new TypeError('Expecting non-empty mnemonic.')
  }

  let { did } = opts
  const { password, mnemonic } = opts
  let ddo
  try {
    ({ did, ddo } = await validate({ did, password, label: 'destroy' }))
  } catch (err) {
    throw err
  }

  if (!mnemonic || 'string' !== typeof mnemonic) {
    throw new TypeError('Expecting non-empty string for mnemonic.')
  }

  if (!(await proxyExists(did))) {
    throw new Error('ara-filesystem.destroy: This content does not have a valid proxy contract')
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

  const owner = getDocumentOwner(ddo, true)
  owner = `${kAidPrefix}${owner}`
  const acct = await account.load({ did: owner, password })
  const proxy = await getProxyAddress(did)

  try {
    const transaction = await tx.create({
      account: acct,
      to: proxy,
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
