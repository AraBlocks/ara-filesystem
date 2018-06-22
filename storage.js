const debug = require('debug')('ara-filesystem:storage')
const ras = require('random-access-storage')
const raf = require('random-access-file')
const hyperdrive = require('hyperdrive')
const fs = require('fs')
const pify = require('pify')
const { create } = require('./create')
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

// TODO(cckelly): normalize identity,
// combine validate methods
async function write(identity, onwrite = noop) {
  _validateIdentity(identity, 'write')

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const rootBuf = web3.utils.asciiToHex('root')
  const sigBuf = web3.utils.asciiToHex('signature')

  let homeDir = resolve(createAFSKeyPath(identity), 'home')

  const archive = hyperdrive((filename) => {
    const path = resolve(homeDir, filename)
    debug(path)
    if (filename.includes('tree') || filename.includes('signatures')) {
      return _createStorage({path, identity})  
    } else {
      return raf(path) 
    }
  })

  // deployed.events.Write(onwrite)
}

async function read({identity, file}) {
  _validateIdentity(identity, 'read')

  const hIdentity = _hashIdentity(identity)

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const result = await deployed.methods.read(hIdentity, file).call()

  return result
}

async function unlink(identity = '', onunlink = noop) {
  _validateIdentity(identity, 'unlink')

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const hIdentity = _hashIdentity(identity)
  deployed.events.Unlink(onunlink)

  const opts = { from: kLocalAccountAddress }
  await deployed.methods.unlink(hIdentity).send(opts)
}

async function _getAccounts(index = 0) {
  return await pify(web3.eth.getAccounts)()[index]
}

function _createStorage({path, identity}) {
  return ras({
    async read(req) {
      debug('read')
    },

    async write(req) {
      debug(req)
      const localBuffer = web3.utils.asciiToHex(req.data.toString())
      const fileIndex = _resolveBufferIndex(path)
      const storageBuffer = await read({identity, file: fileIndex})
      // buffers are different
      if (null === storageBuffer) {
        const deployed = new web3.eth.Contract(abi, kStorageAddress)
        const defaultAccount = await web3.eth.getAccounts()
        const opts = { from: defaultAccount[0] }
        await deployed.methods.write(_hashIdentity(identity), fileIndex, localBuffer).send(opts)
      }
    }
  })
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

function _validateIdentity(identity, label) {
  if (!identity || 'string' !== typeof identity) {
    throw new TypeError(`ara-filesystem:${label}: Identity must be non-empty string.`)
  }
}

function _hexToAscii(h) {
  return h ? web3.utils.hexToAscii(h) : ''
}

function _hashIdentity(identity) {
  return blake2b(Buffer.from(identity)).toString('hex')
}

module.exports = {
  write,
  read,
  unlink
}
