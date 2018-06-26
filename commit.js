const debug = require('debug')('ara-filesystem:commit')
const fs = require('fs')
const pify = require('pify')
const { resolve } = require('path')
const { kFileMappings } = require('./constants')
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
  password
} = {}) {
  await _writeStagedFile({fileIndex, offset, data})
}

async function _readStagedFile() {
  let file
  try { 
    file = await pify(fs.readFile)(kStagedPath, 'utf8')
  } catch (err) { debug(err.stack || err) }
  return file ? JSON.parse(file) : {}
}

async function _writeStagedFile({fileIndex, offset, data} = {}) {
  // create file if not available
  try {
    await pify(fs.access)(kStagedPath)
  } catch (err) {
    await pify(fs.writeFile)(kStagedPath, '')
  }

  const json = await _readStagedFile()
  const hex = data.toString('hex')

  const filename = _getFilenameByIndex(fileIndex)
  if (filename) {
    if (!json[filename]) json[filename] = {}
    json[filename][offset] = hex
    await pify(fs.writeFile)(kStagedPath, JSON.stringify(_encryptJSON(json, 'pass')))
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
  const encryptionKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  
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
