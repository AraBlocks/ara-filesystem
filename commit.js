const debug = require('debug')('ara-filesystem:commit')
const fs = require('fs')
const pify = require('pify')
const { resolve } = require('path')
const { 
  kFileMappings,
  kTempPassword } = require('./constants')
const {
  kContentTree,
  kContentSignatures,
  kMetadataTree,
  kMetadataSignatures
} = kFileMappings
const { generateKeypair, encrypt, decrypt, randomBytes } = require('./util')

const kStagedPath = resolve(__dirname, './staged.json')

async function commit(did) {
  
}

async function append({
  did = '',
  fileIndex,
  offset,
  data,
  password = kTempPassword
} = {}) {
  await _writeStagedFile({fileIndex, offset, data, password})
}

async function _readStagedFile(password) {
  let file
  try { 
    file = await pify(fs.readFile)(kStagedPath, 'utf8')
  } catch (err) { debug(err.stack || err) }
  const decryptedFile = file ? JSON.parse(_decryptJSON(file, password)) : {}
  return decryptedFile
}

async function _writeStagedFile({fileIndex, offset, data, password} = {}) {
  // create file if not available
  try {
    await pify(fs.access)(kStagedPath)
  } catch (err) {
    await pify(fs.writeFile)(kStagedPath, '')
  }

  const json = await _readStagedFile(password)
  const hex = data.toString('hex')

  const filename = _getFilenameByIndex(fileIndex)
  if (filename) {
    if (!json[filename]) json[filename] = {}
    json[filename][offset] = hex
    await pify(fs.writeFile)(kStagedPath, JSON.stringify(_encryptJSON(json, password)))
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

  encryptionKey.fill(0)

  return decryptedJSON
}

async function _deleteStagedFile() {
  await pify(fs.unlink)(kStagedPath)
}

function _getFilenameByIndex(index) {
  const key = Object.keys(kFileMappings).find(k => kFileMappings[k].index === index)
  return kFileMappings[key].name
}

module.exports = {
  commit,
  append
}
