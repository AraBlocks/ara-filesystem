/* eslint-disable no-shadow */

const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')
const { createAFSKeyPath, getCache } = require('./key-path')
const { defaultStorage } = require('./storage')
const hasDIDMethod = require('has-did-method')
const { createCFS } = require('cfsnet/create')
const crypto = require('ara-crypto')
const aid = require('ara-identity')
const extend = require('extend')
const pify = require('pify')

const debug = require('debug')('ara-filesystem:create')

const {
  KEY_LENGTH,
  AID_PREFIX,
  OWNER_SUFFIX
} = require('./constants')

const {
  proxyExists,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  validate,
  transform: { toHexString }
} = require('ara-util')

/**
 * Creates an AFS with the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.owner
 * @param {?Object}  opts.ddo
 * @param {String}   opts.password
 * @param {String}   opts.afsPassword
 * @param {Function} opts.storage
 * @param {Object}   [opts.keyringOpts]
 * @param {Object}   [opts.keyringOpts.archiver]
 * @param {Object}   [opts.keyringOpts.resolver]
 * @return {Object}
 */
async function create(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if (('string' !== typeof opts.owner || !opts.owner)
    && ('string' !== typeof opts.did || !opts.did)) {
    throw new TypeError('Expecting non-empty string.')
  } else if (opts.ddo && 'object' !== typeof opts.ddo) {
    throw new TypeError('Expecting opts.ddo to be an object.')
  } else if (opts.password && 'string' !== typeof opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if (opts.afsPassword && 'string' !== typeof opts.afsPassword) {
    throw TypeError('Expecting non-empty password.')
  } else if (opts.storage && 'function' !== typeof opts.storage) {
    throw new TypeError('Expecting storage to be a function.')
  }

  let {
    did,
    ddo,
    keyringOpts = {},
    afsPassword
  } = opts

  const {
    owner,
    password,
    storage
  } = opts

  keyringOpts = extend(true, {
    archiver: {
      network: (keyringOpts.archiver && keyringOpts.archiver.network) || keyringOpts.network,
      secret: (keyringOpts.archiver && keyringOpts.archiver.secret) || keyringOpts.secret,
      keyring: (keyringOpts.archiver && keyringOpts.archiver.keyring) || keyringOpts.keyring
    },
    resolver: {
      network: (keyringOpts.resolver && keyringOpts.resolver.network) || keyringOpts.network,
      secret: (keyringOpts.resolver && keyringOpts.resolver.secret) || keyringOpts.secret,
      keyring: (keyringOpts.resolver && keyringOpts.resolver.keyring) || keyringOpts.keyring
    }
  }, keyringOpts)

  afsPassword = afsPassword || password

  let afs
  let mnemonic
  const writable = Boolean(afsPassword)
  const cache = await getCache()

  if (did) {
    let proxy
    if (!ddo) {
      if (await proxyExists(did)) {
        proxy = await getProxyAddress(did)
      }
    }

    try {
      ({ did, ddo } = await validate({
        did,
        password: afsPassword,
        label: 'create',
        ddo,
        keyringOpts: keyringOpts.resolver
      }))
    } catch (err) {
      throw err
    }

    const etcKeyMatcher = key => 'metadata' === key.id.split('#')[1]
    const [ { publicKeyHex: etcKey } ] = ddo.publicKey.filter(etcKeyMatcher)

    // retrieve local options from cache
    let cachedOpts = await pify(cache.read)(did) || {}
    if (!cachedOpts.id || !cachedOpts.path) {
      cachedOpts = extend(true, cachedOpts, {
        id: did,
        path: createAFSKeyPath(did),
      })
      await pify(cache.write)(did, cachedOpts)
    }

    opts = extend(true, cachedOpts, opts, {
      did,
      storage: defaultStorage(did, writable, storage, proxy),
      key: Buffer.from(did, 'hex'),
      partitions: {
        etc: {
          key: etcKey
        }
      }
    })

    try {
      afs = await createCFS(opts)
    } catch (err) {
      await pify(cache.delete)(did)
      throw err
    }

    afs.did = did
    afs.ddo = ddo
  } else if (owner) {
    try {
      ({ owner: did } = await validate({
        did: owner,
        password,
        label: 'create',
        ddo,
        keyringOpts: keyringOpts.resolver
      }))
    } catch (err) {
      throw err
    }
    console.log('afs password', afsPassword)
    const afsId = await createIdentity({ password: afsPassword, owner })

    // Note: Do not change this to `({ mnemonic } = afsId)`, it causes a weird scoping issue.
    // eslint-disable-next-line prefer-destructuring
    mnemonic = afsId.mnemonic

    const { publicKey, secretKey } = afsId
    const afsDid = toHexString(publicKey)

    let afsDdo
    try {
      // generate AFS key path
      const path = createAFSKeyPath(afsDid)
      afs = await createCFS({
        id: afsDid,
        key: publicKey,
        secretKey,
        path,
        storage: defaultStorage(afsDid, writable, storage)
      })

      // add local options to cache
      const cachedOpts = {
        id: afsDid,
        path,
      }
      await pify(cache.write)(afsDid, cachedOpts)

      // metadata partition publicKey
      const metadataPublicKey = toHexString(afs.partitions.etc.key)

      // recreate identity with additional publicKey
      const afsId = await createIdentity({
        password,
        mnemonic,
        owner,
        metadataPublicKey
      })

      await aid.util.writeIdentity(afsId)
      if (!ddo) {
        await aid.archive(afsId, keyringOpts.archiver)

        afsDdo = await aid.resolve(toHexString(afsId.publicKey), keyringOpts.resolver)

        if (null == afsDdo || 'object' !== typeof afsDdo) {
          throw new TypeError('AFS identity not successfully resolved.')
        }
      } else {
        afsDdo = JSON.parse(JSON.stringify(afsId.ddo))
      }
    } catch (err) {
      throw err
    }

    afs.did = afsDid
    afs.ddo = afsDdo

    // clear buffers
    publicKey.fill(0)
    secretKey.fill(0)
  }

  return {
    afs,
    mnemonic
  }
}

async function createIdentity({
  password = '',
  owner = '',
  metadataPublicKey = '',
  mnemonic
} = {}) {
  if (null == password || 'string' !== typeof password) {
    throw new TypeError('Expecting password to be non-empty string.')
  }

  if (null == owner || 'string' !== typeof owner) {
    throw new TypeError('Expecting non-empty string.')
  }

  if ((hasDIDMethod(owner) && KEY_LENGTH !== owner.slice(AID_PREFIX.length).length)
    || (!hasDIDMethod(owner) && KEY_LENGTH !== owner.length)) {
    throw new TypeError('Owner identifier must be 64 chars.')
  }

  owner += OWNER_SUFFIX
  if (!hasDIDMethod(owner)) {
    owner = `${AID_PREFIX}${owner}`
  }

  let publicKey
  if (metadataPublicKey) {
    const buf = Buffer.from(metadataPublicKey, 'hex')
    publicKey = [ {
      id: 'metadata',
      publicKeyHex: metadataPublicKey,
      publicKeyBase64: crypto.base64.encode(buf).toString(),
      publicKeyBase58: crypto.base58.encode(buf).toString()
    } ]
  }

  let identity
  try {
    const ddo = {
      authentication: {
        type: kEd25519VerificationKey2018,
        publicKey: owner
      },
      publicKey
    }
    identity = await aid.create({
      mnemonic,
      password,
      ddo
    })
  } catch (err) { debug(err.stack || err) }

  return identity
}

module.exports = {
  create,
  createIdentity
}
