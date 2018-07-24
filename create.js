/* eslint-disable no-shadow */

const debug = require('debug')('ara-filesystem:create')
const { blake2b, keyPair } = require('ara-crypto')
const { createAFSKeyPath } = require('./key-path')
const { toHex, writeIdentity } = require('ara-identity/util')
const { resolve } = require('path')
const { createCFS } = require('cfsnet/create')
const aid = require('./aid')
const multidrive = require('multidrive')
const pify = require('pify')
const mkdirp = require('mkdirp')
const rc = require('./rc')()
const toilet = require('toiletdb')
const { defaultStorage } = require('./storage')

const {
  validate,
  loadSecrets,
  hash
} = require('./util')

const {
  kResolverKey,
  kArchiverKey
} = require('./constants')

/**
 * Creates an AFS with the given Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function create({
  password = '',
  owner = null,
  did = null,
}) {
  if ((null == owner || 'string' !== typeof owner || !owner) && (null == did || 'string' !== typeof did || !did)) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  if ('string' !== typeof password || !password) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty password')
  }

  let afs
  let mnemonic
  if (did) {
    let result
    try {
      // semicolon because interpreter doesn't like `)(`
      result = await validate({ did, password, label: 'create' });
      ({ did } = result)
    } catch (err) {
      throw err
    }

    const pathPrefix = hash(did)
    const drives = await createMultidrive({ did, pathPrefix, password })

    const path = createAFSKeyPath(did)

    afs = await pify(drives.create)({
      id: pathPrefix,
      path
    })

    afs.did = did
    afs.ddo = result.ddo
  } else if (owner) {
    try {
      ({ owner: did } = await validate({ owner, password, label: 'create' }))
    } catch (err) {
      throw err
    }

    const afsId = await aid.create({ password, owner });
    ({ mnemonic } = afsId)

    await writeIdentity(afsId)

    let keystore = await loadSecrets(kArchiverKey)
    await aid.archive(afsId, { key: kArchiverKey, keystore })

    const { publicKey, secretKey } = afsId
    const afsDid = toHex(publicKey)

    keystore = await loadSecrets(kResolverKey)
    const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore })

    if (null == afsDdo || 'object' !== typeof afsDdo) {
      throw new TypeError('ara-filesystem.create: AFS identity not successfully archived')
    }

    const kp = keyPair(blake2b(secretKey))
    const id = hash(afsDid)

    try {
      // generate AFS key path
      const path = createAFSKeyPath(afsDid)
      afs = await createCFS({
        id,
        key: kp.publicKey,
        secretKey: kp.secretKey,
        path,
        storage: defaultStorage(afsDid, password),
        shallow: true
      })
    } catch (err) { debug(err.stack || err) }

    afs.did = afsDid
    afs.ddo = afsDdo

    // clear buffers
    kp.publicKey.fill(0)
    kp.secretKey.fill(0)
  }

  return {
    afs,
    mnemonic
  }

  async function createMultidrive({ did, pathPrefix, password }) {
    await pify(mkdirp)(rc.afs.archive.store)
    const nodes = resolve(rc.afs.archive.store, pathPrefix)
    const store = toilet(nodes)

    const drives = await pify(multidrive)(
      store,
      async (opts, done) => {
        const { id, path } = opts
        try {
          const afs = await createCFS({
            id,
            path,
            storage: defaultStorage(did, password),
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
