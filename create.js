/* eslint-disable no-shadow */

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
  toHex,
  writeIdentity
} = require('ara-identity/util')

const {
  getDocumentKeyHex,
  validate
} = require('ara-util')

/**
 * Creates an AFS with the given Ara identity
 * @param {String}  did
 * @param {String}   owner
 * @param {String}   password
 * @param {Function} storage
 * @return {Object}
 */
async function create({
  password = '',
  owner = null,
  did = null,
  storage = null,
  keyringOpts
}) {
  if ((null == owner || 'string' !== typeof owner || !owner) && (null == did || 'string' !== typeof did || !did)) {
    throw new TypeError('Expecting non-empty string.')
  } else if (storage && 'function' !== typeof storage) {
    throw new TypeError('Expecting storage to be a function.')
  }

  let afs
  let mnemonic
  if (did) {
    let ddo
    try {
      ({ did, ddo } = await validate({ did, password, label: 'create' }))
    } catch (err) {
      throw err
    }

    let proxy
    if (await proxyExists(did)) {
      proxy = await getProxyAddress(did)
    }

    const id = getDocumentKeyHex(ddo)
    const drives = await createMultidrive({ did: id, password, storage })
    const path = createAFSKeyPath(id)
    const key = Buffer.from(id, 'hex')
    
    const opts = { id, key, path }
    if (proxy) {
      opts.proxy = proxy
    }
    afs = await pify(drives.create)(opts)

    afs.did = did
    afs.ddo = ddo
  } else if (owner) {
    try {
      ({ owner: did } = await validate({ owner, password, label: 'create' }))
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
      await aid.archive(afsId, keyringOpts)

      afsDdo = await aid.resolve(toHex(afsId.publicKey))
      if (null == afsDdo || 'object' !== typeof afsDdo) {
        throw new TypeError('AFS identity not successfully resolved.')
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

  async function createMultidrive({
    did,
    password,
    storage
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
          path,
          proxy
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
