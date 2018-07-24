/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:commit')
const fs = require('fs')
const pify = require('pify')
const { web3 } = require('ara-context')()
const { resolve, dirname } = require('path')
const { createAFSKeyPath } = require('./key-path')
const { setPrice } = require('./price')
const { abi } = require('./build/contracts/Storage.json')

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
  decryptJSON,
  getDeployedContract,
  validate,
  hash
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
  const deployed = getDeployedContract(abi, kStorageAddress)
  const { resolveBufferIndex } = require('./storage')
  const hIdentity = hash(did)

  const contentsLength = Object.keys(contents).length
  for (let i = 0; i < contentsLength; i++) {
    const key = Object.keys(contents)[i]
    const buffers = contents[key]
    const index = resolveBufferIndex(key)
    const buffersLength = Object.keys(buffers).length

    for (let j = 0; j < buffersLength; j++) {
      const offset = Object.keys(buffers)[j]
      const data = `0x${buffers[offset]}`

      const lastWrite = contentsLength - 1 === i && buffersLength - 1 === j
      await deployed.methods.write(hIdentity, index, offset, data, lastWrite).send({
        from: accounts[0],
        gas: 500000
      })
    }
  }

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

  let cost = 0
  try {
    const hIdentity = hash(did)
    const { resolveBufferIndex } = require('./storage')
    const deployed = getDeployedContract(abi, kStorageAddress)

    const path = generateStagedPath(did)
    const contents = _readStagedFile(path, password)

    const contentsLength = Object.keys(contents).length
    for (let i = 0; i < contentsLength; i++) {
      const key = Object.keys(contents)[i]
      const buffers = contents[key]
      const index = resolveBufferIndex(key)
      const buffersLength = Object.keys(buffers).length

      for (let j = 0; j < buffersLength; j++) {
        const offset = Object.keys(buffers)[j]
        const data = `0x${buffers[offset]}`

        const lastWrite = contentsLength - 1 === i && buffersLength - 1 === j
        cost += await deployed.methods
          .write(hIdentity, index, offset, data, lastWrite)
          .estimateGas({ gas: 500000 })
      }
    }
  } catch (err) {
    throw new Error(err)
  }

  return cost
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
