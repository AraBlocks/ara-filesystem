/* eslint-disable no-shadow */

const debug = require('debug')('ara-filesystem:create')
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
const { getDocumentKeyHex } = require('ara-util')

const {
  loadSecrets,
  validate
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
    const drives = await createMultidrive({ did: id, password })
    const path = createAFSKeyPath(id)
    const key = Buffer.from(id, 'hex')

    afs = await pify(drives.create)({
      id,
      key,
      path
    })

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

    let keystore = await loadSecrets(kArchiverKey)
    await aid.archive(afsId, { key: kArchiverKey, keystore })

    const { publicKey, secretKey } = afsId
    const afsDid = toHex(publicKey)

    keystore = await loadSecrets(kResolverKey)
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
        storage: defaultStorage(afsDid, password),
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

  async function createMultidrive({ did, password }) {
    await pify(mkdirp)(rc.afs.archive.store)
    const nodes = resolve(rc.afs.archive.store, did)
    const store = toilet(nodes)

    const drives = await pify(multidrive)(
      store,
      async (opts, done) => {
        const { id, key, path } = opts
        try {
          const afs = await createCFS({
            id,
            key,
            path,
            storage: defaultStorage(id, password),
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
