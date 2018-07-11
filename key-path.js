const { blake2b } = require('ara-crypto')
const { resolve } = require('path')
const rc = require('./rc')()
const fs = require('fs')

function createAFSKeyPath(id) {
  const { root } = rc.afs.archive

  if (null == id || 'string' !== typeof id) {
    throw new TypeError('ara-filesystem.key-path: Expecting non-empty string for id')
  }

  try {
    fs.accessSync(root)
  } catch (err) {
    fs.mkdir(root)
  }

  const hash = blake2b(Buffer.from(id))
  const path = resolve(root, hash.toString('hex'))
  return path
}

module.exports = {
  createAFSKeyPath
}
