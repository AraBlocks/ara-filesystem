/* eslint-disable no-await-in-loop */

const { abi } = require('ara-contracts/build/contracts/AFS.json')
const { kAFSAddress } = require('ara-contracts/constants')
const debug = require('debug')('ara-filesystem:commit')
const fs = require('fs')
const pify = require('pify')
const { createAFSKeyPath } = require('./key-path')
const { validate, hashDID } = require('ara-util')
const { toHex } = require('ara-identity/util')
const { resolve, dirname } = require('path')
const { web3 } = require('ara-context')()
const { contract } = require('ara-web3')
const { setPrice } = require('./price')
const contract = require('ara-web3/contract')
const account = require('ara-web3/account')
const tx = require('ara-web3/tx')

const {
  kMetadataTreeName,
  kMetadataTreeIndex,
  kMetadataTreeBufferSize,
  kMetadataSignaturesName,
  kMetadataSignaturesIndex,
  kMetadataSignaturesBufferSize,
  kStagingFile
} = require('./constants')

const {
  encryptJSON,
  decryptJSON,
  getDocumentOwner,
  validate
} = require('./util')

async function commit({
  did = '',
  password = '',
  price = -1,
  estimate = false
} = {}) {
  try {
    ({ did, ddo } = await validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  const path = generateStagedPath(did)
  try {
    await pify(fs.access)(path)
  } catch (err) {
    throw new Error('No staged commits ready to be pushed')
  }

  const contents = _readStagedFile(path, password)
  const accounts = await web3.eth.getAccounts()
  const deployed = contract.get(abi, kAFSAddress)
  const hIdentity = hashDID(did)

  const exists = await _hasBeenCommitted(contents, hIdentity)

  const mtData = _getWriteData(0, contents, exists)
  const msData = _getWriteData(1, contents, exists)

  let result
  if (exists) {
    result = await _append({ deployed, mtData, msData, hIdentity }, estimate)
  } else {
    result = await _write({ deployed, mtData, msData, hIdentity }, estimate) 
  }

  if (estimate) {
    return result
  }

  await _deleteStagedFile(path)

  if (0 <= price) {
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

async function estimateCommitGasCost({
  did = '',
  password = ''
} = {}) {
  return commit({
    did,
    password,
    estimate: true
  })
}

async function _append(opts, estimate = true) {
  const { offsets: mtOffsets, buffer: mtBuffer } = opts.mtData
  const { offsets: msOffsets, buffer: msBuffer } = opts.msData

  const { deployed, hIdentity } = opts
  const query = deployed.methods.append(hIdentity, mtOffsets, msOffsets, mtBuffer, msBuffer)

  if (!estimate) {
    const accounts = await web3.eth.getAccounts()
    return query.send({ from: accounts[0], gas: 1000000 })
  } else {
    return query.estimateGas({ gas: 1000000 })
  }
}

async function _write(opts, estimate = true) {
  const { offsets: mtOffsets, sizes: mtSizes, buffer: mtBuffer } = opts.mtData
  const { offsets: msOffsets, sizes: msSizes, buffer: msBuffer } = opts.msData 

  const { deployed, hIdentity } = opts
  const query = deployed.methods.write(hIdentity, mtOffsets, msOffsets, 
    mtSizes, msSizes, mtBuffer, msBuffer)

  if (!estimate) {
    const accounts = await web3.eth.getAccounts()
    return query.send({ from: accounts[0], gas: 1000000 })
  } else {
    return query.estimateGas({ gas: 1000000 })
  }
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
      if (offsets[i+1] && offsets[i+1] !== _hexToBytes(buffer.length)) {
        const diff = offsets[i+1] - _hexToBytes(buffer.length)
        buffer += toHex(Buffer.alloc(diff))
      }
      return length
    })
    buffer = `0x${buffer}`
    result = { buffer, offsets, sizes }
  } else {
    offsets.shift()
    buffers.shift()
    const buffer = `0x${buffers.join('')}`
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
async function _hasBeenCommitted(contents, hIdentity) {
  const buf = `0x${_getBufferFromStaged(contents, 0, 0)}`
  const deployed = contract.get(abi, kStorageAddress)
  return deployed.methods.hasBuffer(hIdentity, 0, 0, buf).call()
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
