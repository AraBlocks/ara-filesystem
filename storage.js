const { abi } = require('ara-contracts/build/contracts/AFS.json')
const { kAFSAddress } = require('ara-contracts/constants')
const debug = require('debug')('ara-filesystem:storage')
const contract = require('ara-web3/contract')
const ras = require('random-access-storage')
const account = require('ara-web3/account')
const raf = require('random-access-file')
const unixify = require('unixify')
const tx = require('ara-web3/tx')

const {
  kMetadataTreeIndex,
  kMetadataSignaturesIndex,
  kMetadataTreeName: mTreeName,
  kMetadataSignaturesName: mSigName
} = require('./constants')

const {
  append,
  retrieve
} = require('./commit')

const {
  hash,
  getDocumentOwner
} = require('./util')

const {
  resolve,
  basename
} = require('path')

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
  const deployed = contract.get(abi, kAFSAddress)

  const writable = Boolean(password)

  return ras({
    async read(req) {
      const { offset, size } = req
      debug(filename, 'read at offset', offset, 'size', size)
      let buffer = (writable) ? retrieve({
        did: identity,
        fileIndex,
        offset,
        password
      }) : null
      // data is not staged, must retrieve from bc
      if (!buffer) {
        buffer = await deployed.methods.read(fileIndex, offset).call()
      }
      req.callback(null, _decode(buffer))
    },

    write(req) {
      if (writable) {
        const { data, offset, size } = req
        debug(filename, 'staged write at offset', offset, 'size', size)
        append({
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
        { ddo } = await validate({ identity, password, label: 'storage' })
        const owner = getDocumentOwner(ddo, true)
        const acct = await account.load({ did: owner, password })

        const transaction = tx.create({
          account: acct,
          to: kAFSAddress,
          data: {
            abi,
            name: 'unlist'
          }
        })
        tx.sendSignedTransaction(transaction)
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
