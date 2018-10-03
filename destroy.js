const { MissingOptionError } = require('ara-util/errors')
const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:destroy')
const { kAidPrefix } = require('./constants')
const { access } = require('fs')
const rimraf = require('rimraf')
const extend = require('extend')
const pify = require('pify')
const aid = require('./aid')
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
 */
async function destroy(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if (opts.password && 'string' !== typeof opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if (!opts.keyringOpts) {
    throw new MissingOptionError({ expectedKey: 'keyringOpts', actualValue: opts })
  } else if (!opts.keyringOpts.secret) {
    throw new MissingOptionError({ expectedKey: 'keyringOpts.secret', actualValue: opts.keyringOpts })
  } else if (!opts.keyringOpts.network &&
      !(rc.network && rc.network.identity && rc.network.identity.resolver)) {
    throw new MissingOptionError({
      expectedKey: [ 'keyringOpts.network', 'rc.network.identity.resolver' ],
      actualValue: { keyringOpts: opts.keyringOpts, rc },
      suggestion: 'setting `rc.network.identity.resolver`'
    })
  } else if (!opts.keyringOpts.keyring &&
      !(rc.network && rc.network.identity && rc.network.identity.keyring)) {
    throw new MissingOptionError({
      expectedKey: [ 'keyringOpts.keyring', 'rc.network.identity.keyring' ],
      actualValue: { keyringOpts: opts.keyringOpts, rc },
      suggestion: 'setting `rc.network.identity.keyring`'
    })
  }

  let { did, keyringOpts } = opts
  did = normalize(did)

  // Replace everything in the first object with the second. This method will allow us to have defaults.
  keyringOpts = extend(true, {
    network: rc.network && rc.network.identity && rc.network.identity.resolver,
    keyring: rc.network && rc.network.identity && rc.network.identity.keyring
  }, keyringOpts)

  let path

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

  const { store } = rc.afs.archive
  path = resolvePath(store, basename(path))

  // delete AFS toilet db file
  try {
    await pify(access)(path)
    await pify(rimraf)(path)
  } catch (err) {
    debug('db file at %s does not exist', path)
  }

  const { password } = opts

  if (password) {
    try {
      ({ did } = await aid.validate({
        did,
        password,
        label: 'destroy',
        keyringOpts
      }))
    } catch (err) {
      throw err
    }

    if (!(await proxyExists(did))) {
      debug('This content does not have a valid proxy contract.')
      return
    }

    const afsDdo = await aid.resolve(did, keyringOpts)
    let owner = getDocumentOwner(afsDdo, true)

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
}

module.exports = {
  destroy
}
