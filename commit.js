/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:commit')
const fs = require('fs')
const pify = require('pify')
const { toHex } = require('ara-identity/util')
const { web3 } = require('ara-context')()
const { resolve, dirname } = require('path')
const { createAFSKeyPath } = require('./key-path')
const { setPrice } = require('./price')
const { abi } = require('./build/contracts/Storage.json')
const { contract } = require('ara-web3')
const { validate, hashDID } = require('ara-util')

const {
  kMetadataTreeName,
  kMetadataTreeIndex,
  kMetadataSignaturesName,
  kMetadataSignaturesIndex,
  kStagingFile,
  kStorageAddress
} = require('./constants')

const {
  encryptJSON,
  decryptJSON
} = require('./util')

async function commit({
  did = '',
  password = '',
  price = -1
} = {}) {
  try {
    ({ did } = await validate({ did, password, label: 'commit' }))
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
  const deployed = contract.get(abi, kStorageAddress)
  const hIdentity = hashDID(did)

  // metadata/tree
  const {
    buffer: mtBuffer,
    offsets: mtOffsets,
    sizes: mtSizes
  } = _getWriteData(0, contents)

  // metadata/signatures
  const {
    buffer: msBuffer,
    offsets: msOffsets,
    sizes: msSizes
  } = _getWriteData(1, contents)

  await deployed.methods.writeAll(
    hIdentity, mtOffsets, msOffsets, mtSizes,
    msSizes, mtBuffer, msBuffer
  ).send({ from: accounts[0], gas: 1000000 })

  await _deleteStagedFile(path)

  if (0 <= price) {
    await setPrice({ did, password, price })
  }

  return null
}

function append({
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

function retrieve({
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

// TODO(cckelly): cleanup
async function estimateCommitGasCost({
  did = '',
  password = ''
} = {}) {
  try {
    ({ did } = await validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  const path = generateStagedPath(did)
  const contents = _readStagedFile(path, password)
  const deployed = getDeployedContract(abi, kStorageAddress)
  const hIdentity = hashDID(did)

  // metadata/tree
  const {
    buffer: mtBuffer,
    offsets: mtOffsets,
    sizes: mtSizes
  } = _getWriteData(0, contents)

  // metadata/signatures
  const {
    buffer: msBuffer,
    offsets: msOffsets,
    sizes: msSizes
  } = _getWriteData(1, contents)

  const call = await deployed.methods.writeAll(
    hIdentity, mtOffsets, msOffsets,
    mtSizes, msSizes, mtBuffer, msBuffer
  )

  const cost = await call.estimateGas({ gas: 1000000 })

  return cost
}

function _getWriteData(index, contents) {
  const map = contents[_getFilenameByIndex(index)]
  let buffer = ''
  const offsets = Object.keys(map).map(v => parseInt(v, 10))
  const sizes = Object.values(map).map((v, i) => {
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

  return {
    buffer,
    offsets,
    sizes
  }
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
  append,
  retrieve,
  generateStagedPath,
  estimateCommitGasCost
}
