/* eslint-disable no-shadow */

const debug = require('debug')('ara-filesystem:create')
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
  kResolverKey,
  kArchiverKey
} = require('./constants')

const {
  getDocumentKeyHex,
  loadSecretsKeystore,
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
  storage = null
}) {
  if ((null == owner || 'string' !== typeof owner || !owner) && (null == did || 'string' !== typeof did || !did)) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  } else if (storage && 'function' !== typeof storage) {
    throw new TypeError('ara-filesystem.create: Expecting storage to be a function.')
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

    const id = getDocumentKeyHex(ddo)
    const drives = await createMultidrive({ did: id, password, storage })
    const path = createAFSKeyPath(id)
    const key = Buffer.from(id, 'hex')
    if (await proxyExists(did)) {
      const proxy = await getProxyAddress(did)
      afs = await pify(drives.create)({
        id,
        key,
        path,
        proxy
      })
    } else {
      afs = await pify(drives.create)({
        id,
        key,
        path
      })
    }

    afs.did = did
    afs.ddo = ddo
  } else if (owner) {
    try {
      ({ owner: did } = await validate({ owner, password, label: 'create' }))
    } catch (err) {
      throw err
    }

    const afsId = await aid.create({ password, owner });
    ({ mnemonic } = afsId)

    await writeIdentity(afsId)

    let keystore = await loadSecretsKeystore(kArchiverKey)
    await aid.archive(afsId, { key: kArchiverKey, keystore })

    const { publicKey, secretKey } = afsId
    const afsDid = toHex(publicKey)

    keystore = await loadSecretsKeystore(kResolverKey)
    const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore })

    if (null == afsDdo || 'object' !== typeof afsDdo) {
      throw new TypeError('ara-filesystem.create: AFS identity not successfully archived')
    }

    try {
      // generate AFS key path
      const path = createAFSKeyPath(afsDid)
      afs = await createCFS({
        id: afsDid,
        key: publicKey,
        secretKey,
        path,
        storage: defaultStorage(afsDid, password, storage),
        shallow: true
      })
    } catch (err) { debug(err.stack || err) }

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

  async function createMultidrive({ did, password, storage }) {
    await pify(mkdirp)(rc.afs.archive.store)
    const nodes = resolve(rc.afs.archive.store, did)
    const store = toilet(nodes)

    const drives = await pify(multidrive)(
      store,
      async (opts, done) => {
        const { id, key, path } = opts
        let proxy = ''
        if (opts.proxy) {
          ({ proxy } = opts) 
        }

        try {
          const afs = await createCFS({
            id,
            key,
            path,
<<<<<<< HEAD
            storage: defaultStorage(id, password, storage),
=======
>>>>>>> f36d38a7caaf5c864a4c12fc974cdef544c06c87
            storage: defaultStorage(id, password, proxy),
            shallow: true
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
