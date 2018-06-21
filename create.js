const debug = require('debug')('ara-filesystem:create')
const { blake2b, keyPair } = require('ara-crypto')
const { createAFSKeyPath } = require('./key-path')
const { toHex } = require('ara-identity/util')
const { secrets } = require('ara-network')
const { resolve } = require('path')
const { createCFS } = require('cfsnet/create')
const {
  kAidPrefix, kDidPrefix, kArchiverKey, kResolverKey
} = require('./constants')
const aid = require('./aid')
const bip39 = require('bip39')
const multidrive = require('multidrive')
const pify = require('pify')
const mkdirp = require('mkdirp')
const rc = require('./rc')()
const toilet = require('toiletdb')

/**
 * Creates an AFS with the given Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function create({
  owner = null,
  did = null
}) {
  if ((null == owner || 'string' !== typeof owner || !owner) && (null == did || 'string' !== typeof did || !did)) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  if (did) {
    did = validateDid(did)

    const keystore = await loadSecrets(kResolverKey)
    const afsDdo = await aid.resolve(did, { key: kResolverKey, keystore })

    if (null === afsDdo || 'object' !== typeof afsDdo) {
      throw new TypeError('ara-filesystem.create: Unable to resolve AFS DID')
    }

    const pathPrefix = toHex(blake2b(Buffer.from(did)))
    const drives = await createMultidrive(pathPrefix)

    const path = createAFSKeyPath(did)
    console.log(path)
    const afs = await pify(drives.create)({
      id: pathPrefix,
      path
    })

    afs.did = did
    afs.ddo = afsDdo

    return afs
  } else if (owner) {
    owner = validateDid(owner)

    // TODO (mahjiang): ensure ownership of DID
    const ddo = await aid.resolve(owner)
    if (null === ddo || 'object' !== typeof ddo) {
      throw new TypeError('ara-filesystem.create: Unable to resolve owner DID')
    }

    const mnemonic = bip39.generateMnemonic()
    debug(mnemonic)
    const afsId = await aid.create(mnemonic, owner)

    let keystore = await loadSecrets(kArchiverKey)
    await aid.archive(afsId, { key: kArchiverKey, keystore })

    const { publicKey, secretKey } = afsId
    const afsDid = toHex(publicKey)

    keystore = await loadSecrets(kResolverKey)
    const afsDdo = await aid.resolve(afsDid, { key: kResolverKey, keystore })

    const kp = keyPair(blake2b(secretKey))
    const id = toHex(blake2b(Buffer.from(afsDid)))

    let afs
    try {
      // generate AFS key path
      const path = createAFSKeyPath(afsDid)
      debug(path)
      afs = await createCFS({
        id,
        key: kp.publicKey,
        secretKey: kp.secretKey,
        path
      })
    } catch (err) { debug(err.stack || err) }

    afs.did = afsDid
    afs.ddo = afsDdo

    // clear buffers
    kp.publicKey.fill(0)
    kp.secretKey.fill(0)

    return afs
  }

  return null

  async function createMultidrive(pathPrefix) {
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
            path
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

function validateDid(did) {
  if (0 === did.indexOf(kDidPrefix)) {
    if (0 !== did.indexOf(kAidPrefix)) {
      throw new TypeError('Expecting a DID URI with an "ara" method.')
    } else {
      return did.substring(kAidPrefix.length)
    }
  }
  return did
}

async function loadSecrets(key) {
  const { public: pub } = await secrets.load({ key, public: true })
  return pub.keystore
}

module.exports = {
  create
}
