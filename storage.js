const debug = require('debug')('ara-filesystem:storage')
const ras = require('random-access-storage')
const raf = require('random-access-file')
const unixify = require('unixify')
const { resolve, basename } = require('path')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Storage.json')
const { hashDID } = require('ara-util')

const {
  writeToStaged,
  readFromStaged
} = require('./commit')

const {
  kStorageAddress,
  kMetadataTreeIndex,
  kMetadataSignaturesIndex,
  kMetadataTreeName: mTreeName,
  kMetadataSignaturesName: mSigName
} = require('./constants')

function defaultStorage(identity, password) {
  return (filename, drive, path) => {
    filename = unixify(filename)
    if ('home' === basename(path) && (filename.includes(mTreeName)
      || filename.includes(mSigName))) {
      return create({ filename, identity, password })
    }
    return raf(resolve(path, filename))
  }
}

function create({ filename, identity, password }) {
  const fileIndex = resolveBufferIndex(filename)
  const deployed = new web3.eth.Contract(abi, kStorageAddress)

  const hIdentity = hashDID(identity)
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
      if (!buffer) {
        buffer = await deployed.methods.read(hIdentity, fileIndex, offset).call()
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
    },

    async del(req) {
      if (writable) {
        const opts = await _getTxOpts()
        await deployed.methods.del(hIdentity).send(opts)
      }
      req.callback(null)
    }
  })
}

async function _getTxOpts(index = 0) {
  const defaultAccount = await web3.eth.getAccounts()
  return { from: defaultAccount[index], gas: 5000000 }
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
    throw new TypeError('Path must be non-empty string')
  }

  path = unixify(path)

  if (-1 === path.indexOf('/')) {
    throw new Error('Path is not properly formatted')
  }

  let index = -1
  if (mTreeName === path) {
    index = kMetadataTreeIndex
  } else if (mSigName === path) {
    index = kMetadataSignaturesIndex
  }
  return index
}

module.exports = {
  resolveBufferIndex,
  defaultStorage
}

module.exports = {
  resolveBufferIndex,
  defaultStorage
}
