const debug = require('debug')('ara-filesystem:debug')
const { createAFSKeyPath } = require('./key-path')
const { createCFS } = require('cfsnet/create')
const { resolve } = require('path')
const pify = require('pify')
const fs = require('fs')

const kMetadataFile = 'metadata.json'

async function writeFile(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.filepath || 'string' !== typeof opts.filepath) {
    throw new TypeError('File path must be a non-empty string.')
  }

  const { did, filepath } = opts
  try {
    await pify(fs.access)(filepath)
  } catch (err) {
    throw new Error(`Filepath ${filepath} 'doesn\'t exist.`)
  }

  let contents = await pify(fs.readFile)(filepath, 'utf8')
  try {
    contents = JSON.parse(contents)
  } catch (err) {
    throw new Error('Contents of file is not valid JSON.')
  }

  await _writeMetadataFile(did, contents)  

  return contents
}

async function writeKey(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be be a non-empty string.')
  } else if (!opts.value) {
    throw new TypeError('Must provide a value to store.')
  }

  const { did, key, value } = opts
  if (!(await _metadataFileExists(did))) {
    await _createMetadataFile(did)
  }

  const contents = await _readMetadataFile(did)
  contents[key] = value

  await _writeMetadataFile(did, contents)
  debug('%s written to metadata', key)
  return contents
}

async function readKey(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be a non-empty string.')
  }

  const { did, key } = opts
  const contents = await _readMetadataFile(did)
  if (!contents.hasOwnProperty(key)) {
    throw new Error(`Metadata file does not contain key ${key}.`)
  }

  debug('metadata key %s: %s', key, contents[key].toString())
  return contents[key]
}

async function delKey(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be a non-empty string.')
  }

  const { did, key } = opts
  const contents = await _readMetadataFile(did)
  if (!contents.hasOwnProperty(key)) {
    throw new Error(`Metadata file does not contain key ${key}.`)
  }

  delete contents[key]
  await _writeMetadataFile(did, contents)

  debug('%s removed from metadata', key)
}

async function clear(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  }

  const { did } = opts
  if (!(await _metadataFileExists(did))) {
    throw new Error('No metadata to clear.')
  }

  // sets metadata contents to {}
  await _createMetadataFile(did)
}

async function _readMetadataFile(did) {
  if (!did || 'string' !== typeof did) {
    throw new TypeError('DID URI must be non-empty string.')
  }
  
  const cfs = await _getEtcCFS(did)
  let file
  try {
    file = await cfs.readFile(kMetadataFile)
  } catch (err) {
    throw new Error('Metadata file doesn\t exist.')
  }
  return JSON.parse(file.toString())
}

async function _writeMetadataFile(did, contents) {
  const cfs = await _getEtcCFS(did)
  await cfs.writeFile(kMetadataFile, Buffer.from(JSON.stringify(contents)))
}

async function _createMetadataFile(did) {
  await _writeMetadataFile(did, {})
}

async function _metadataFileExists(did) {
  const cfs = await _getEtcCFS(did)
  try {
    await cfs.readFile(kMetadataFile)
  } catch (err) {
    return false
  }
  return true
}

async function _getEtcCFS(did) {
  const path = _getEtcPath(did)
  return createCFS({ path })
}

function _getEtcPath(did) {
  return resolve(createAFSKeyPath(did), 'etc')
}

module.exports = {
  writeFile,
  writeKey,
  readKey,
  delKey,
  clear,
  readFile: _readMetadataFile
}
