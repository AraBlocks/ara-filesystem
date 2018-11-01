const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:destroy')
const { AID_PREFIX } = require('./constants')
const aid = require('ara-identity')
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
  createIdentityKeyPathFromPublicKey
} = require('./key-path')

const {
  normalize,
  getDocumentOwner,
  validate,
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
 * @param {Object}   [opts.keyringOpts]
 */
async function destroy(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if (opts.password && 'string' !== typeof opts.password) {
    throw new TypeError('Expecting non-empty password.')
  } else if (opts.estimate && 'boolean' !== typeof opts.estimate) {
    throw new TypeError('Expecting estimate to be a boolean.')
  }

  const estimate = Boolean(opts.estimate)
  const { keyringOpts } = opts
  let { did } = opts
  did = normalize(did)

  let path

  if (!estimate) {
    try {
      // destroy AFS identity
      path = createIdentityKeyPathFromPublicKey(did)
      await pify(access)(path)
      await pify(rimraf)(path)

      // delete AFS on disk
      path = createAFSKeyPath(did)
      await pify(access)(path)
      await pify(rimraf)(path)
    } catch (err) {
      throw err
    }

    const { store } = rc.network.afs.archive
    path = resolvePath(store, basename(path))

    // delete AFS toilet db file
    try {
      await pify(access)(path)
      await pify(rimraf)(path)
    } catch (err) {
      debug('db file at %s does not exist', path)
    }
  }

  const { password } = opts

  try {
    ({ did } = await validate({
      did,
      password,
      label: 'destroy',
      keyringOpts
    }))
  } catch (err) {
    throw err
  }

  if (!(await proxyExists(did))) {
    throw new Error('Content does not have a valid proxy contract')
  }

  const afsDdo = await aid.resolve(did, keyringOpts)
  let owner = getDocumentOwner(afsDdo, true)

  owner = `${AID_PREFIX}${owner}`
  const acct = await account.load({ did: owner, password })
  const proxy = await getProxyAddress(did)

  let transaction
  try {
    transaction = await tx.create({
      account: acct,
      to: proxy,
      gasLimit: 1000000,
      data: {
        abi,
        functionName: 'unlist'
      }
    })
    if (estimate) {
      return tx.estimateCost(transaction)
    }
  } catch (err) {
    throw err
  }

  return tx.sendSignedTransaction(transaction)
}

module.exports = {
  destroy
}
