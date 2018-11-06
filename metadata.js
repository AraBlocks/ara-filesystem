const debug = require('debug')('ara-filesystem:debug')
const { validate } = require('ara-util')
const { create } = require('./create')
const pify = require('pify')
const fs = require('fs')

const kMetadataFile = 'metadata.json'

/**
 * Writes a metadata JSON file to the metadata partition of an AFS
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.filepath
 * @return {Object}
 */
async function writeFile(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.password || 'string' !== typeof opts.password) {
    throw new TypeError('Password must be non-empty string.')
  } else if (!opts.filepath || 'string' !== typeof opts.filepath) {
    throw new TypeError('File path must be a non-empty string.')
  }

  const {
    keyringOpts = {},
    password,
    filepath,
    did
  } = opts

  const partition = await _getEtcPartition(opts)
  try {
    await validate({
      did,
      password,
      keyringOpts,
      label: 'writeFile'
    })
  } catch (err) {
    throw err
  }

  try {
    await pify(fs.access)(filepath)
  } catch (err) {
    throw new Error(`Filepath ${filepath} doesn't exist.`)
  }

  let contents = await pify(fs.readFile)(filepath, 'utf8')
  try {
    contents = JSON.parse(contents)
  } catch (err) {
    throw new Error('Contents of file is not valid JSON.')
  }

  await _writeMetadataFile(partition, contents)

  return contents
}

/**
 * Writes a metadata key/value pair to the metadata partition of an AFS
 * @param {Object}                             opts
 * @param {String}                             opts.did
 * @param {String}                             opts.key
 * @param {Mixed} opts.value
 * @return {Object}
 */
async function writeKey(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.password || 'string' !== typeof opts.password) {
    throw new TypeError('Password must be non-empty string.')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be be a non-empty string.')
  } else if (!opts.value) {
    throw new TypeError('Must provide a value to store.')
  }

  const {
    did,
    key,
    value,
    password,
    keyringOpts = {}
  } = opts

  const partition = await _getEtcPartition(opts)
  try {
    await validate({
      did,
      password,
      keyringOpts,
      label: 'writeKey'
    })
  } catch (err) {
    throw err
  }

  if (!(await _metadataFileExists(partition))) {
    await _createMetadataFile(partition)
  }

  const contents = await _readMetadataFile(partition)
  contents[key] = value

  await _writeMetadataFile(partition, contents)
  debug('%s written to metadata', key)
  return contents
}

/**
 * Reads a metadata key from the metadata partition of an AFS
 * @param {Object} opts
 * @param {String} opts.did
 * @param {String} opts.key
 * @return {Mixed}
 */
async function readKey(opts = {}) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be a non-empty string.')
  }
  const { key } = opts
  const contents = await readFile(opts)
  if (!Object.prototype.hasOwnProperty.call(contents, key)) {
    throw new Error(`Metadata file does not contain key ${key}.`)
  }

  debug('metadata key %s: %s', key, contents[key].toString())
  return contents[key]
}

/**
 * Deletes a metadata key/value pair from the metadata partition of an AFS
 * @param {Object} opts
 * @param {String} opts.did
 * @param {String} opts.key
 */
async function delKey(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  } else if (!opts.password || 'string' !== typeof opts.password) {
    throw new TypeError('Password must be non-empty string.')
  } else if (!opts.key || 'string' !== typeof opts.key) {
    throw new TypeError('Key must be a non-empty string.')
  }

  const {
    did,
    key,
    password,
    keyringOpts = {}
  } = opts

  const partition = await _getEtcPartition(opts)
  try {
    await validate({
      did,
      password,
      keyringOpts,
      label: 'delKey'
    })
  } catch (err) {
    throw err
  }

  const contents = await _readMetadataFile(partition)
  if (!Object.prototype.hasOwnProperty.call(contents, key)) {
    throw new Error(`Metadata file does not contain key ${key}.`)
  }

  delete contents[key]
  await _writeMetadataFile(partition, contents)

  debug('%s removed from metadata', key)
  return contents
}

/**
 * Empties all metadata contents of an AFS
 * @param {Object} opts
 * @param {String} opts.did
 */
async function clear(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  }

  const partition = await _getEtcPartition(opts)
  if (!(await _metadataFileExists(partition))) {
    throw new Error('No metadata to clear.')
  }

  // sets metadata contents to {}
  await _createMetadataFile(partition)
}

/**
 * Reads all metadata from an AFS
 * @param {Object} opts
 * @param {String} opts.did
 * @return {Object}
 */
async function readFile(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts to be an object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be a non-empty string.')
  }

  const partition = await _getEtcPartition(opts)
  const file = await _readMetadataFile(partition)
  return file
}

async function _readMetadataFile(partition) {
  if (!(await _metadataFileExists(partition))) {
    throw new Error('Metadata file doesn\'t exist.')
  }

  const file = await pify(partition.readFile)(kMetadataFile)
  return JSON.parse(file.toString())
}

async function _writeMetadataFile(partition, contents) {
  await pify(partition.writeFile)(kMetadataFile, Buffer.from(JSON.stringify(contents)))
}

async function _createMetadataFile(partition) {
  await _writeMetadataFile(partition, {})
}

async function _metadataFileExists(partition) {
  try {
    await pify(partition.access)(kMetadataFile)
    return true
  } catch (_) {
    return false
  }
}

async function _getEtcPartition(opts) {
  let partition
  try {
    const { afs } = await create(opts)
    partition = afs.partitions.etc
  } catch (err) {
    throw err
  }
  return partition
}

module.exports = {
  writeFile,
  writeKey,
  readFile,
  readKey,
  delKey,
  clear
}
