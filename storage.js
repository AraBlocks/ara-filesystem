const debug = require('debug')('ara-filesystem:storage')
const ras = require('random-access-storage')
const raf = require('random-access-file')
const ram = require('random-access-memory')
const fs = require('fs')
const pify = require('pify')
const { resolve } = require('path')
const { append } = require('./commit')
const { createAFSKeyPath } = require('./key-path')
const { blake2b } = require('ara-crypto')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Storage.json')
const { generateKeypair, encrypt, decrypt } = require('./util')

const { 
  kMetadataRegister, 
  kContentRegister,
  kTreeFile,
  kSignaturesFile,
  kStorageAddress,
  kFileMappings
} = require('./constants')

const {
  kContentTree,
  kContentSignatures,
  kMetadataTree,
  kMetadataSignatures
} = kFileMappings

const noop = () => { }

module.exports = (identity) => {
  return (filename, drive, path) => {
    if (filename.includes('tree') || filename.includes('signatures')) {
      return create({filename, identity})
    } else {
      return raf(resolve(path, filename))
    }
  }
}

function create({filename, identity}) {
  const fileIndex = _resolveBufferIndex(filename)
  const deployed = new web3.eth.Contract(abi, kStorageAddress)

  return ras({
    async read(req) {
      const { offset, size } = req
      debug(filename, 'read at offset', offset, 'size', size)
      const buffer = await deployed.methods.read(_hashIdentity(identity), fileIndex, offset).call()
      req.callback(null, _decode(buffer))
    },

    async write(req) {
      const { data, offset, size } = req
      debug(filename, 'write at offset', offset, 'size', size)
      const hex = web3.utils.bytesToHex(data)
      const opts = await _getTxOpts()
      await deployed.methods.write(_hashIdentity(identity), fileIndex, offset, hex).send(opts)
      await append({did: identity, fileIndex, data, offset})
      req.callback(null)
    },

    async stat(req) {
      const stats = await deployed.methods.stat(_hashIdentity(identity), fileIndex).call()
      req.callback(null, stats)
    },

    async del(req) {
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
    index = (kTreeFile === file) ? kMetadataTree.index : kMetadataSignatures.index
  } else if (kContentRegister === register) {
    index = (kTreeFile === file) ? kContentTree.index : kContentSignatures.index
  }
  return index
}

function _hashIdentity(identity) {
  return blake2b(Buffer.from(identity)).toString('hex')
}

function _hexToAscii(h) {
  return h ? web3.utils.hexToAscii(h) : ''
}
