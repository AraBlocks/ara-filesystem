/* eslint-disable no-await-in-loop */

const { abi } = require('ara-contracts/build/contracts/AFS.json')
const { kAFSAddress } = require('ara-contracts/constants')
const debug = require('debug')('ara-filesystem:commit')
const { createAFSKeyPath } = require('./key-path')
const contract = require('ara-web3/contract')
const account = require('ara-web3/account')
const { setPrice } = require('./price')
const tx = require('ara-web3/tx')
const pify = require('pify')
const fs = require('fs')

const {
  kMetadataTreeName,
  kMetadataTreeIndex,
  kMetadataSignaturesName,
  kMetadataSignaturesIndex,
  kStagingFile
} = require('./constants')

const {
  encryptJSON,
  decryptJSON,
  getDocumentOwner,
  validate,
  hash
} = require('./util')

const {
  resolve,
  dirname
} = require('path')

async function commit({
  did = '',
  password = '',
  price = -1
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
  const owner = getDocumentOwner(ddo, true);
  const acct = await account.load({ did: owner, password })
  const { resolveBufferIndex } = require('./storage')

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

      const transaction = tx.create({
        account: acct,
        to: kAFSAddress,
        data: {
          abi,
          name: 'write',
          values: [
            index,
            offset,
            data,
            lastWrite
          ]
        }
      })
      tx.sendSignedTransaction(transaction)
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
    const { resolveBufferIndex } = require('./storage')
    const deployed = contract.get(abi, kAFSAddress)

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
          .write(index, offset, data, lastWrite)
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
