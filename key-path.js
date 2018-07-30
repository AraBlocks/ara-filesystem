const { blake2b } = require('ara-crypto')
const { resolve } = require('path')
const { toHex } = require('ara-identity/util')
const rc = require('./rc')()
const fs = require('fs')

function createAFSKeyPath(did) {
  const { root } = rc.afs.archive

  if (null == did || 'string' !== typeof did) {
    throw new TypeError('ara-filesystem.key-path: Expecting non-empty string for id')
  }

  try {
    fs.accessSync(root)
  } catch (err) {
    fs.mkdirSync(root)
  }

  const hash = blake2b(Buffer.from(did, 'hex'))
  return resolve(root, toHex(hash))
}

function createIdentityKeyPath(ddo) {
  const { root } = rc.araId.archive

  if (null == ddo || 'object' !== typeof ddo) {
    throw new TypeError('ara-filesystem.key-path: Expecting object for identity')
  }

  let { publicKey } = ddo
  if (Array.isArray(publicKey) && 0 < publicKey.length) {
    const { publicKeyHex } = publicKey[0]
    publicKey = Buffer.from(publicKeyHex, 'hex')
  }

  const hash = toHex(blake2b(publicKey))
  return resolve(root, hash)
}

module.exports = {
  createAFSKeyPath,
  createIdentityKeyPath
}
