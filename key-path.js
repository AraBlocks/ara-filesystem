const { toHexString } = require('ara-util/transform')
const { blake2b } = require('ara-crypto')
const { resolve } = require('path')
const toilet = require('toiletdb')
const mkdirp = require('mkdirp')
const pify = require('pify')
const rc = require('./rc')()
const fs = require('fs')

function createAFSKeyPath(did) {
  const { root } = rc.network.afs.archive

  if (null == did || 'string' !== typeof did) {
    throw new TypeError('Expecting non-empty string for id.')
  }

  try {
    fs.accessSync(root)
  } catch (err) {
    fs.mkdirSync(root)
  }

  const hash = blake2b(Buffer.from(did, 'hex'))
  return resolve(root, toHexString(hash))
}

function createIdentityKeyPathFromPublicKey(publicKey) {
  const { root } = rc.network.identity
  if (Array.isArray(publicKey) && 0 < publicKey.length) {
    const { publicKeyHex } = publicKey[0]
    publicKey = Buffer.from(publicKeyHex, 'hex')
  }
  if ('string' === typeof publicKey) {
    publicKey = Buffer.from(publicKey, 'hex')
  }
  const hash = toHexString(blake2b(publicKey))
  return resolve(root, hash)
}

async function getCache() {
  await mkdirp(rc.network.afs.archive.root)
  const store = toilet(rc.network.afs.archive.store)
  await pify(store.open)()
  return store
}

module.exports = {
  getCache,
  createAFSKeyPath,
  createIdentityKeyPathFromPublicKey
}
