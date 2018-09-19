/* eslint-disable no-await-in-loop */

const { MissingOptionError } = require('ara-util/errors')
const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:commit')
const { createAFSKeyPath } = require('./key-path')
const pify = require('pify')
const aid = require('./aid')
const fs = require('fs')
const rc = require('./rc')()

const {
  proxyExists,
  deployProxy,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  kAidPrefix,
  kStagingFile,
  kMetadataTreeName,
  kMetadataTreeIndex,
  kMetadataSignaturesName,
  kMetadataSignaturesIndex
} = require('./constants')

const {
  getDocumentOwner,
  web3: {
    tx,
    call,
    account,
    toHex
  }
} = require('ara-util')

const {
  encryptJSON,
  decryptJSON
} = require('./util')

const {
  setPrice,
  estimateSetPriceGasCost
} = require('./price')

const {
  resolve,
  dirname
} = require('path')

/**
 * Commits the AFS with the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {Boolean}  opts.estimate
 * @param {Number}   opts.price
 * @return {Object}
 */
async function commit(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if (opts.estimate && 'boolean' !== typeof opts.estimate) {
    throw new TypeError('Expecting boolean.')
  } else if (opts.price && ('number' !== typeof opts.price || opts.price < 0)) {
    throw new TypeError('Expecting whole number price.')
  } else if (!opts.secret) {
    throw new MissingOptionError({ expectedKey: 'opts.secret', expectedKey: opts })
  } else if (!opts.network && !rc.network.resolver) {
    throw new MissingOptionError({ expectedKey: 'opts.network', expectedKey: opts, suggestion: 'setting `rc.network.resolver`' })
  } else if (!opts.keyring && !rc.network.identity.keyring) {
    throw new MissingOptionError({ expectedKey: 'opts.keyring', expectedKey: opts, suggestion: 'setting `rc.network.identity.keyring`' })
  }

  let { did, estimate } = opts
<<<<<<< HEAD
  const { password, price } = opts
=======
  const {
    password,
    price,
    secret,
    network = rc.network.resolver,
    keyring = rc.network.identity.keyring
  } = opts
>>>>>>> 06737e5... refactor(): Add error messages, rely on rc config

  estimate = estimate || false

  let ddo
  try {
    ({ did, ddo } = await aid.validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  let proxy
  if (await proxyExists(did)) {
    proxy = await getProxyAddress(did)
  } else {
    proxy = await deployProxy({ contentDid: did, password })
  }

  debug('proxy address', proxy)

  const path = generateStagedPath(did)
  try {
    await pify(fs.access)(path)
  } catch (err) {
    throw new Error('No staged commits ready to be pushed')
  }

  const contents = _readStagedFile(path, password)

  const exists = await _hasBeenCommitted(contents, proxy)

  const mtData = _getWriteData(0, contents, exists)
  const msData = _getWriteData(1, contents, exists)

  let owner = getDocumentOwner(ddo, true)
  owner = `${kAidPrefix}${owner}`
  const acct = await account.load({ did: owner, password })

  let result = await _write({
    mtData,
    msData,
    account: acct,
    proxy
  }, estimate, exists)

  if (estimate) {
    if (0 < price) {
      const setPriceGasCost = await estimateSetPriceGasCost({
        did,
        password,
        price
      })
      result = Number(result) + Number(setPriceGasCost)
    }
    return result.toString()
  }

  await _deleteStagedFile(path)

  if (0 < price) {
    await setPrice({ did, password, price })
  }

  return result
}

function writeToStaged({
  did,
  fileIndex,
  offset,
  data,
  password = ''
} = {}) {
  const path = generateStagedPath(did)
  _writeStagedFile({
    fileIndex,
    offset,
    data,
    password,
    path
  })
}

function readFromStaged({
  did,
  fileIndex,
  offset = 0,
  password = ''
} = {}) {
  const path = generateStagedPath(did)
  const contents = _readStagedFile(path, password)
  fileIndex = _getFilenameByIndex(fileIndex)

  let result
  if (contents[fileIndex] && contents[fileIndex][offset]) {
    result = contents[fileIndex][offset]
  }
  return result
}

function generateStagedPath(did) {
  const path = resolve(createAFSKeyPath(did), kStagingFile)
  try {
    fs.accessSync(path)
  } catch (err) {
    _makeStagedFile(path)
  }
  return path
}

/**
 * Estimates the gas cost of sending the staged commit
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {Number}   opts.price
 * @return {Object}
 */
async function estimateCommitGasCost(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if (opts.price && ('number' !== typeof opts.price || opts.price < 0)) {
    throw new TypeError('Expecting whole number price.')
  }

  opts = Object.assign(opts, { estimate: true })
  return commit(opts)
}

async function _write(opts, estimate = true, append = false) {
  const { offsets: mtOffsets, buffer: mtBuffer } = opts.mtData
  const { offsets: msOffsets, buffer: msBuffer } = opts.msData

  const { account: acct, proxy } = opts
  const transaction = await tx.create({
    account: acct,
    to: proxy,
    gasLimit: 4000000,
    data: {
      abi,
      functionName: append ? 'append' : 'write',
      values: [
        mtOffsets,
        msOffsets,
        mtBuffer,
        msBuffer
      ]
    }
  })

  if (estimate) {
    return tx.estimateCost(transaction)
  }

  return tx.sendSignedTransaction(transaction)
}

function _getWriteData(index, contents, append) {
  const map = contents[_getFilenameByIndex(index)]
  let buffer = ''
  const offsets = Object.keys(map).map(v => parseInt(v, 10))
  const buffers = Object.values(map)

  let result
  if (!append) {
    const sizes = buffers.map((v, i) => {
      buffer += v
      const length = _hexToBytes(v.length)

      // inserts 0s to fill buffer based on offsets
      if (offsets[i + 1] && offsets[i + 1] !== _hexToBytes(buffer.length)) {
        const diff = offsets[i + 1] - _hexToBytes(buffer.length)
        buffer += toHex(Buffer.alloc(diff))
      }
      return length
    })
    buffer = `0x${buffer}`
    result = { buffer, offsets, sizes }
  } else {
    offsets.shift()
    buffers.shift()
    buffer = `0x${buffers.join('')}`
    result = { offsets, buffer }
  }

  return result
}

function _hexToBytes(hex) {
  return hex / 2
}

function _readStagedFile(path, password) {
  const contents = fs.readFileSync(path, 'utf8')
  return JSON.parse(decryptJSON(contents, password))
}

function _writeStagedFile({
  fileIndex,
  offset,
  data,
  password,
  path
} = {}) {
  let json = {}
  try {
    fs.accessSync(path)
    json = _readStagedFile(path, password)
  } catch (err) {
    fs.writeFileSync(path, '')
  }

  const hex = data.toString('hex')

  const filename = _getFilenameByIndex(fileIndex)
  if (filename) {
    if (!json[filename]) json[filename] = {}
    json[filename][offset] = hex
    const encrypted = JSON.stringify(encryptJSON(json, password))
    fs.writeFileSync(path, encrypted)
  }
}

function _makeStagedFile(path) {
  try {
    fs.mkdirSync(dirname(path))
  } catch (err) {
    debug('could not make dir at', path, 'err', err)
  }
}

async function _deleteStagedFile(path) {
  try {
    await pify(fs.unlink)(path)
  } catch (err) {
    debug('could not unlink', path)
  }
}

// checks to see if header written to staged has been pushed to blockchain
// if it has, we know that AFS has been committed already
async function _hasBeenCommitted(contents, proxy) {
  const buf = `0x${_getBufferFromStaged(contents, 0, 0)}`
  return call({
    abi,
    address: proxy,
    functionName: 'hasBuffer',
    arguments: [
      0,
      0,
      buf
    ]
  })
}

function _getBufferFromStaged(contents, index, offset) {
  const map = contents[_getFilenameByIndex(index)]
  return map[offset]
}

function _getFilenameByIndex(index) {
  if (index === kMetadataTreeIndex) {
    return kMetadataTreeName
  } else if (index === kMetadataSignaturesIndex) {
    return kMetadataSignaturesName
  }
  debug('index not recognized', index)
  return null
}

module.exports = {
  commit,
  writeToStaged,
  readFromStaged,
  generateStagedPath,
  estimateCommitGasCost
}
