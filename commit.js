/* eslint-disable no-await-in-loop */

const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:commit')
const { createAFSKeyPath } = require('./key-path')
const { setPrice } = require('./price')
const pify = require('pify')
const fs = require('fs')

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
  validate,
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
  resolve,
  dirname
} = require('path')

async function commit({
  password = '',
  price = -1,
  estimate = false,
  did = ''
} = {}) {
  let ddo
  try {
    ({ did, ddo } = await validate({ did, password, label: 'commit' }))
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
  owner = kAidPrefix + owner
  const acct = await account.load({ did: owner, password })

  let result
  if (exists) {
    result = await _append({
      mtData,
      msData,
      account: acct,
      proxy
    }, estimate)
  } else {
    result = await _write({
      mtData,
      msData,
      account: acct,
      proxy
    }, estimate)
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

  const { account: acct, proxy } = opts

  const transaction = await tx.create({
    account: acct,
    to: proxy,
    gasLimit: 1000000,
    data: {
      abi,
      functionName: 'append',
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

async function _write(opts, estimate = true) {
  const { offsets: mtOffsets, buffer: mtBuffer } = opts.mtData
  const { offsets: msOffsets, buffer: msBuffer } = opts.msData

  const { account: acct, proxy } = opts

  const transaction = await tx.create({
    account: acct,
    to: proxy,
    gasLimit: 1000000,
    data: {
      abi,
      functionName: 'write',
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
