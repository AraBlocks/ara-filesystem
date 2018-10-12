const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:storage')
const ras = require('random-access-storage')
const raf = require('random-access-file')
const unixify = require('unixify')

const {
  writeToStaged,
  readFromStaged
} = require('./commit')

const {
  METADATA_TREE_INDEX,
  METADATA_SIGNATURES_INDEX,
  METADATA_TREE_NAME: mTreeName,
  METADATA_SIGNATURES_NAME: mSigName
} = require('./constants')

const {
  web3: {
    call
  }
} = require('ara-util')

const {
  resolve,
  basename
} = require('path')

function defaultStorage(identity, password, storage = null, proxy = '') {
  if (storage && 'function' !== typeof storage) {
    throw new TypeError('ara-filesystem.storage: Expecting storage to be a function.')
  }
  return (filename, drive, path) => {
    filename = unixify(filename)
    if ('home' === basename(path)
      && (filename.includes(mTreeName) || filename.includes(mSigName))) {
      return create({
        filename,
        identity,
        password,
        proxy
      })
    }
    const file = resolve(path, filename)
    return storage ? storage(file) : raf(file)
  }
}

function create({
  filename,
  identity,
  password,
  proxy
} = {}) {
  const fileIndex = resolveBufferIndex(filename)

  const writable = Boolean(password)

  return ras({
    async read(req) {
      const { offset, size } = req
      debug(filename, 'read at offset', offset, 'size', size)
      let buffer = (writable) ? readFromStaged({
        did: identity,
        fileIndex,
        offset,
        password
      }) : null
      // data is not staged, must retrieve from bc
      if (!buffer && proxy) {
        buffer = await call({
          abi,
          address: proxy,
          functionName: 'read',
          arguments: [
            fileIndex,
            offset
          ]
        })
      }
      req.callback(null, _decode(buffer))
    },

    write(req) {
      if (writable) {
        const { data, offset, size } = req
        debug(filename, 'staged write at offset', offset, 'size', size)
        writeToStaged({
          did: identity,
          fileIndex,
          data,
          offset,
          password
        })
      }
      req.callback(null)
    }
  })
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
