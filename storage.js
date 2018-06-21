const debug = require('debug')('ara-filesystem:storage')
const ras = require('random-access-storage')
const raf = require('random-access-file')
const hyperdrive = require('hyperdrive')
const fs = require('fs')
const pify = require('pify')
const { resolve } = require('path')
const { createAFSKeyPath } = require('./key-path')
const { blake2b } = require('ara-crypto')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Storage.json')

const kStorageAddress = '0x345ca3e014aaf5dca488057592ee47305d9b3e10'

const noop = () => { }

const fileIndices = {
  kContentTree: 0,
  kContentSignatures: 1,
  kMetadataTree: 2,
  kMetadataSignatures: 3
}

async function write(identity, onwrite = noop) {
  _validateIdentity(identity, 'write')

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const hIdentity = _hashIdentity(identity)
  const rootBuf = web3.utils.asciiToHex('root')
  const sigBuf = web3.utils.asciiToHex('signature')

  const path = createAFSKeyPath(identity)
  debug(path)

  // const archive = hyperdrive((filename) => {
  //   debug('filename', filename)
  //   const path = resolve(homeDir, filename)
  //   if (filename.includes('tree') || filename.includes('signatures')) {
  //     return _createStorage({path, identity})  
  //   } else {
  //     return raf(resolve(homeDir, filename))
  //   }
  // })  

  // deployed.events.Write(onwrite)

  // const opts = { from: kLocalAccountAddress }
  // await deployed.methods.write(hIdentity, rootBuf, sigBuf, price).send(opts)
}

async function read({identity, file}) {
  _validateIdentity(identity, 'read')

  const hIdentity = _hashIdentity(identity)

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const result = await deployed.methods.read(hIdentity, file).call()

  debug(result)
  return {
    root: _hexToAscii(result.root),
    signature: _hexToAscii(result.signature)
  }
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
  debug('IN HERE', path)
  return ras({
    async read(req) {
      debug('read')
    },

    async write(req) {
      const localBuffer = req.data
      debug(localBuffer)
    }
  })
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
