const debug = require('debug')('ara-filesystem:debug')
const { createAFSKeyPath } = require('./key-path')
const { createCFS } = require('cfsnet/create')
const { resolve } = require('path')

const kMetadataFile = 'metadata.json'

async function write(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be be a non-empty string')
  } else if (!opts.value) {
    throw new TypeError('Must provide a value to store')
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

async function read(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be a non-empty string')
  }

  const { did, key } = opts
  const contents = await _readMetadataFile(did)

  debug('metadata key %s: %s', key, value.toString())
  return contents[key]
}

async function del(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be a non-empty string')
  }

  const { did, key } = opts
  const contents = await _readMetadataFile(did)
  if (!contents.hasOwnProperty(key)) {
    throw new Error('Metadata file does not contrain key', key)
  }

  delete contents[key]
  await _writeMetadataFile(did, contents)

  debug('%s removed from metadata', key)
}

async function _readMetadataFile(did) {
  const cfs = await _getEtcCFS(did)
  const file = await cfs.readFile(kMetadataFile)
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
  del,
  write,
  read,
}
