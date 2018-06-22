const debug = require('debug')('ara-filesystem:storage')
const ras = require('random-access-storage')
const ram = require('random-access-memory')
const raf = require('random-access-file')
const fs = require('fs')
const pify = require('pify')
const { resolve } = require('path')
const { createAFSKeyPath } = require('./key-path')
const { blake2b } = require('ara-crypto')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Storage.json')

const { 
  kMetadataRegister, 
  kContentRegister,
  kTreeFile,
  kSignaturesFile,
  kStorageAddress
} = require('./constants')

const noop = () => { }

const fileIndices = {
  kContentTree: 0,
  kContentSignatures: 1,
  kMetadataTree: 2,
  kMetadataSignatures: 3
}

module.exports = (identity) => {
  return (filename) => {
    if (filename.includes('tree') || filename.includes('signatures')) {
      return create({filename, identity})
    } else {
      return ram()
    }
  }
}

function create({filename, identity}) {
  const fileIndex = _resolveBufferIndex(filename)
  const deployed = new web3.eth.Contract(abi, kStorageAddress)

  return ras({
    async read(req) {
      const { offset, size } = req
      const buffer = await deployed.methods.read(_hashIdentity(identity), fileIndex, offset).call()
      debug('read', filename, 'hex', buffer)
      req.callback(null, _decode(buffer))
    },

    async write(req) {
      const { data, offset, size } = req
      const hex = web3.utils.bytesToHex(data)
      debug('write', filename, 'hex', hex)
      const opts = await _getTxOpts()
      await deployed.methods.write(_hashIdentity(identity), fileIndex, offset, hex).send(opts)
      req.callback(null)
    },

    async stat(req) {
      debug('stat', identity)
      const stats = await deployed.methods.stat(_hashIdentity(identity), fileIndex).call()
      req.callback(null, stats)
    },

    async del(req) {
      debug('del', identity)
      const opts = await _getTxOpts()
      await deployed.methods.del(_hashIdentity(identity)).send(opts)
      req.callback(null)
    }
  })
}

async function _getTxOpts(index = 0) {
  const defaultAccount = await web3.eth.getAccounts()
  return { from: defaultAccount[index], gas: 5000000 }
}

function _decode(bytes) {
  if ('string' == typeof bytes) {
    bytes = bytes.replace(/^0x/, '')
    bytes = Buffer.from(bytes, 'hex')
  }
  return Buffer.from(bytes, 'hex')
}

function _resolveBufferIndex(path) {
  const parsedPath = path.split('/')
  const file = parsedPath[parsedPath.length - 1]
  const register = parsedPath[parsedPath.length - 2]
  let index = -1
  if (kMetadataRegister === register) {
    index = (kTreeFile === file) ? fileIndices.kMetadataTree : fileIndices.kMetadataSignatures
  } else if (kContentRegister === register) {
    index = (kTreeFile === file) ? fileIndices.kContentTree : fileIndices.kContentSignatures
  }
  return index
}

function _hashIdentity(identity) {
  return blake2b(Buffer.from(identity)).toString('hex')
}

function _hexToAscii(h) {
  return h ? web3.utils.hexToAscii(h) : ''
}
