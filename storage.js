const debug = require('debug')('ara-filesystem:storage')
const storage = require('ara-contracts/storage')
const ras = require('random-access-storage')
const raf = require('random-access-file')
const unixify = require('unixify')

const {
  writeToStaged,
  readFromStaged,
  hasStaged
} = require('./commit')

const {
  METADATA_TREE_INDEX,
  METADATA_SIGNATURES_INDEX,
  METADATA_TREE_NAME: mTreeName,
  METADATA_SIGNATURES_NAME: mSigName
} = require('./constants')

const {
  resolve,
  basename
} = require('path')

function defaultStorage(identity, writable = false, storage = null, proxy = '') {
  if (storage && 'function' !== typeof storage) {
    throw new TypeError('ara-filesystem.storage: Expecting storage to be a function.')
  } else if (!proxy && !writable && !hasStaged(identity)) {
    throw new Error('Expecting either proxy or staged files')
  }

  return (filename, drive, path) => {
    filename = unixify(filename)

    if (_isProxyFile(path, filename)) {
      return _create({
        path,
        filename,
        identity,
        writable,
        proxy
      })
    }
    const file = resolve(path, filename)
    return storage ? storage(file) : raf(file)
  }
}

function _isProxyFile(path, filename) {
  return 'home' === basename(path) && (filename.includes(mTreeName) || filename.includes(mSigName))
}

function _create({
  filename,
  identity,
  writable,
  proxy
} = {}) {
  const fileIndex = resolveBufferIndex(filename)

  if (writable) return ras({ read, write: writeStaged })
  return ras({ read, write: writeNull })

  async function read(req) {
    const { offset, size } = req
    debug(filename, 'read at offset', offset, 'size', size)

    let buffer

    if (hasStaged(identity)) {
      buffer = readFromStaged({
        did: identity,
        fileIndex,
        offset
      })
    }

    if (!buffer && proxy) {
      buffer = await storage.read({
        address: proxy,
        fileIndex,
        offset
      })
    }
      
    if (buffer) {
      req.callback(null, _decode(buffer))
    } else {
      req.callback(new Error('Could not read'))
    }
  },

  function writeStaged(req) {
    const { data, offset, size } = req
    debug(filename, 'staged write at offset', offset, 'size', size)
    writeToStaged({
      did: identity,
      fileIndex,
      data,
      offset
    })
    req.callback(null)
  }

  function writeNull(req) {
    req.callback(null)
  }
}

function _decode(bytes) {
  if ('string' === typeof bytes) {
    bytes = bytes.replace(/^0x/, '')
    bytes = Buffer.from(bytes, 'hex')
  }
  return Buffer.from(bytes, 'hex')
}

function resolveBufferIndex(path) {
  if (!path || 'string' !== typeof path) {
    throw new TypeError('Path must be non-empty string.')
  }

  path = unixify(path)

  if (-1 === path.indexOf('/')) {
    throw new Error('Path is not properly formatted.')
  }

  let index = -1
  if (mTreeName === path) {
    index = METADATA_TREE_INDEX
  } else if (mSigName === path) {
    index = METADATA_SIGNATURES_INDEX
  }
  return index
}

module.exports = {
  resolveBufferIndex,
  defaultStorage
}
