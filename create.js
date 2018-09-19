/* eslint-disable no-shadow */

const { writeIdentity } = require('ara-identity/util')
const { createAFSKeyPath } = require('./key-path')
const { defaultStorage } = require('./storage')
const { createCFS } = require('cfsnet/create')
const multidrive = require('multidrive')
const { resolve } = require('path')
const toilet = require('toiletdb')
const mkdirp = require('mkdirp')
const aid = require('./aid')
const pify = require('pify')
const rc = require('./rc')()

const {
  proxyExists,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  getDocumentKeyHex,
  web3: { toHex }
} = require('ara-util')

/**
 * Creates an AFS with the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.owner
 * @param {?Object}  opts.ddo
 * @param {String}   opts.password
 * @param {Function} opts.storage
 * @param {?Object}  opts.keyringOpts
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
  } else if (opts.storage && 'function' !== typeof opts.storage) {
    throw new TypeError('Expecting storage to be a function.')
  } else if (opts.keyringOpts && 'object' !== typeof opts.keyringOpts) {
    throw new TypeError('Expecting opts.keyringOpts to be an object.')
  }

  let {
    did,
    ddo
  } = opts

  const {
    owner,
    password,
    storage,
    keyringOpts
  } = opts

  keyringOpts = {
    archiver: Object.assign({}, { secret: keyringOpts.secret, keyring: keyringOpts.keyring, network: keyringOpts.archiverNetwork }, keyringOpts.archiver),
    resolver: Object.assign({}, { secret: keyringOpts.secret, keyring: keyringOpts.keyring, network: keyringOpts.resolverNetwork }, keyringOpts.resolver)
  }

  let afs
  let mnemonic
  if (did) {
    let proxy
    if (!ddo) {
      if (await proxyExists(did)) {
        proxy = await getProxyAddress(did)
      }
    }

    try {
      ({ did, ddo } = await aid.validate({
        did,
        password,
        label: 'create',
        ddo,
        keyringOpts: keyringOpts.resolver
      }))
    } catch (err) {
      throw err
    }

    const id = getDocumentKeyHex(ddo)

    const drives = await _createMultidrive({
      did: id,
      password,
      storage,
      proxy
    })
    const path = createAFSKeyPath(id)
    const key = Buffer.from(id, 'hex')

    const opts = { id, key, path }
    afs = await pify(drives.create)(opts)

    afs.did = did
    afs.ddo = ddo
  } else if (owner) {
    try {
      ({ owner: did } = await aid.validate({
        owner,
        password,
        label: 'create',
        ddo,
        keyringOpts
      }))
    } catch (err) {
      throw err
    }

    let afsId = await aid.create({ password, owner });
    ({ mnemonic } = afsId)

    const { publicKey, secretKey } = afsId
    const afsDid = toHex(publicKey)

    let afsDdo
    try {
      // generate AFS key path
      const path = createAFSKeyPath(afsDid)
      afs = await createCFS({
        id: afsDid,
        key: publicKey,
        secretKey,
        path,
        storage: defaultStorage(afsDid, password, storage)
      })

      const etcPath = resolve(path, 'etc')
      // metadata partition publicKey
      const { key } = await createCFS({ path: etcPath })
      const metadataPublicKey = toHex(key)

      // recreate identity with additional publicKey
      afsId = await aid.create({
        password,
        mnemonic,
        owner,
        metadataPublicKey
      });

      ({ mnemonic } = afsId)

      await writeIdentity(afsId)
      if (!ddo) {
        console.log("ARCHI:", keyringOpts.archiver)
        await aid.archive(afsId, keyringOpts.archiver)

        afsDdo = await aid.resolve(toHex(afsId.publicKey))

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

  async function _createMultidrive({
    did,
    password,
    storage,
    proxy
  } = {}) {
    await pify(mkdirp)(rc.afs.archive.store)
    const nodes = resolve(rc.afs.archive.store, did)
    const store = toilet(nodes)

    const drives = await pify(multidrive)(
      store,
      async (opts, done) => {
        const {
          id,
          key,
          path
        } = opts

        try {
          const afs = await createCFS({
            id,
            key,
            path,
            storage: proxy ? defaultStorage(id, password, storage, proxy) : defaultStorage(id, password, storage)
          })
          return done(null, afs)
        } catch (err) {
          done(err)
        }
        return null
      },

      async (afs, done) => {
        try {
          await afs.close()
        } catch (err) {
          return done(err)
        }
        return done(null)
      }
    )
    return drives
  }
}

module.exports = {
  create
}
