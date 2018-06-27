const debug = require('debug')('ara-filesystem:commit')
const fs = require('fs')
const pify = require('pify')
const { blake2b } = require('ara-crypto')
const { resolve } = require('path')
const { toHex } = require('ara-identity/util')
const { createAFSKeyPath } = require('./key-path')
const { web3 } = require('ara-context')()
const { abi } = require('./build/contracts/Storage.json')
const { kFileMappings, kStagingFile } = require('./constants')

const {
  kContentTree,
  kContentSignatures,
  kMetadataTree,
  kMetadataSignatures
} = kFileMappings
const { generateKeypair, encrypt, decrypt, randomBytes } = require('./util')

async function commit({
  did = '',
  password = ''
} = {}) {

  const contents = await _readStagedFile(password)
  // TODO(cckelly): should use reused logic from here and storage.js into util.js
  const deployed = new web3.eth.Contract(abi, kStorageAddress)

  let i = 0
  for (const key in contents) {
    const buffers = contents[key]
    for (const buf in buffers) {
      const data = buffers[buf]
      const hIdentity = blake2b(Buffer.from(did)).toString('hex')
      const defaultAccount = await web3.eth.getAccounts()
      await deployed.methods.write(hIdentity, i, buf, web3.utils.bytesToHex(data)).send({
        from: defaultAccount[0],
        gas: 500000
      })
      debug('committed', data)
    }
    i++
  }

}

async function append({
  did,
  fileIndex,
  offset,
  data,
  password = ''
} = {}) {
  const path = _generatePath(did)
  await _writeStagedFile({fileIndex, offset, data, password, path})
}

async function retrieve({
  did,
  fileIndex,
  offset,
  password = ''
} = {}) {
  const path = _generatePath(did)
  const contents = await _readStagedFile(path, password)
  fileIndex = _getFilenameByIndex(fileIndex)

  let result
  if (contents[fileIndex] && contents[fileIndex][offset]) {
    result = contents[fileIndex][offset]
  }
  return result
}

async function _readStagedFile(path, password) {
  let file
  try { 
    file = await pify(fs.readFile)(path, 'utf8')
  } catch (err) { debug(err.stack || err) }
  const decryptedFile = file ? JSON.parse(_decryptJSON(file, password)) : {}
  return decryptedFile
}

async function _writeStagedFile({fileIndex, offset, data, password, path} = {}) {
  // create file if not available
  try {
    await pify(fs.access)(path)
  } catch (err) {
    await pify(fs.writeFile)(path, '')
  }

  const json = await _readStagedFile(path, password)
  const hex = data.toString('hex')

  const filename = _getFilenameByIndex(fileIndex)
  if (filename) {
    if (!json[filename]) json[filename] = {}
    json[filename][offset] = hex
    await pify(fs.writeFile)(path, JSON.stringify(_encryptJSON(json, password)))
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
  const decryptedJSON = decrypt({keystore}, { key: encryptionKey })

  secretKey.fill(0)
  encryptionKey.fill(0)

  return decryptedJSON
}

function _generatePath(did) {
  return resolve(createAFSKeyPath(did), kStagingFile)
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
