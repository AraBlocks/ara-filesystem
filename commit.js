// (cckelly): disabling as writes need to happen serially
/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:commit')
const fs = require('fs')
const pify = require('pify')
const { blake2b } = require('ara-crypto')
const { resolve, dirname } = require('path')
const { createAFSKeyPath } = require('./key-path')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Storage.json')

const {
  kFileMappings,
  kStagingFile,
  kStorageAddress
} = require('./constants')

const {
  generateKeypair,
  encrypt,
  decrypt,
  randomBytes,
  validateDid
} = require('./util')

// TODO(cckelly): validate password before allowing commit
async function commit({
  did = '',
  password = ''
} = {}) {

  if (!password || 'string' !== typeof password) {
    throw new TypeError('ara-filesystem.commit: Expecting password to be non-empty string')
  }

  did = validateDid(did)
  const path = _generatePath(did)
  try {
    await pify(fs.access)(path)
  } catch (err) {
    return new Error('No staged commits ready to be pushed')
  }

  const contents = _readStagedFile(path, password)

  // TODO(cckelly): should use reused logic from here and storage.js into util.js
  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const { resolveBufferIndex } = require('./storage')
  const accounts = await web3.eth.getAccounts()
  const hIdentity = blake2b(Buffer.from(did)).toString('hex')

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
  return null
}

function append({
  did,
  fileIndex,
  offset,
  data,
  password = ''
} = {}) {
  const path = _generatePath(did)
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
  offset,
  password = ''
} = {}) {
  const path = _generatePath(did)
  const contents = _readStagedFile(path, password)
  fileIndex = _getFilenameByIndex(fileIndex)

  let result
  if (contents[fileIndex] && contents[fileIndex][offset]) {
    result = contents[fileIndex][offset]
  }
  return result
}

function _readStagedFile(path, password) {
  const contents = fs.readFileSync(path, 'utf8')
  return JSON.parse(_decryptJSON(contents, password))
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
    const encrypted = JSON.stringify(_encryptJSON(json, password))
    fs.writeFileSync(path, encrypted)
  }
}

function _encryptJSON(json, password) {
  const { secretKey } = generateKeypair(password)
  const encryptionKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))

  const encryptedJSON = encrypt(JSON.stringify(json), {
    key: encryptionKey,
    iv: randomBytes(16)
  })

  secretKey.fill(0)
  encryptionKey.fill(0)

  return encryptedJSON
}

function _decryptJSON(keystore, password) {
  const { secretKey } = generateKeypair(password)
  const encryptionKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  const decryptedJSON = decrypt({ keystore }, { key: encryptionKey })

  secretKey.fill(0)
  encryptionKey.fill(0)

  return decryptedJSON
}

function _generatePath(did) {
  const path = resolve(createAFSKeyPath(did), kStagingFile)
  try {
    fs.accessSync(path)
  } catch (err) {
    _makeStagedFile(path)
  }
  return path
}

function _makeStagedFile(path) {
  try {
    fs.mkdirSync(dirname(path))
  } catch (err) {
    debug('could not make dir at', path)
  }
}

async function _deleteStagedFile(path) {
  await pify(fs.unlink)(path)
}

function _getFilenameByIndex(index) {
  const key = Object.keys(kFileMappings).find(k => kFileMappings[k].index === index)
  return kFileMappings[key].name
}

module.exports = {
  commit,
  append,
  retrieve
}
