/* eslint-disable no-await-in-loop */

const { abi } = require('ara-contracts/build/contracts/AFS.json')
const debug = require('debug')('ara-filesystem:commit')
const { createAFSKeyPath } = require('./key-path')
const storage = require('ara-contracts/storage')
const pify = require('pify')
const fs = require('fs')

const {
  proxyExists,
  deployProxy,
  getProxyAddress
} = require('ara-contracts/registry')

const {
  AID_PREFIX,
  STAGED_FILE,
  METADATA_TREE_NAME,
  METADATA_TREE_INDEX,
  METADATA_SIGNATURES_NAME,
  METADATA_SIGNATURES_INDEX
} = require('./constants')

const {
  getDocumentOwner,
  validate,
  web3: {
    call,
    account,
    toHex
  }
} = require('ara-util')

const { setPrice } = require('./price')

const {
  resolve,
  dirname
} = require('path')

/**
 * Commits the AFS with the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {Object}   [opts.keyringOpts]
 * @param {Boolean}  opts.estimate
 * @param {Number}   opts.price
 * @return {Object}
 */
async function commit(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if (opts.estimate && 'boolean' !== typeof opts.estimate) {
    throw new TypeError('Expecting boolean.')
  } else if (opts.price && ('number' !== typeof opts.price || opts.price < 0)) {
    throw new TypeError('Expecting whole number price.')
  }

  let { did, estimate } = opts
  const {
    password,
    price,
    keyringOpts
  } = opts

  estimate = estimate || false

  let ddo
  try {
    ({ did, ddo } = await validate({
      did, password, label: 'commit', keyringOpts
    }))
  } catch (err) {
    throw err
  }

  let proxy
  if (await proxyExists(did)) {
    proxy = await getProxyAddress(did)
  } else {
    proxy = await deployProxy({ contentDid: did, password, keyringOpts })
  }

  debug('proxy address', proxy)

  const path = generateStagedPath(did)
  try {
    await pify(fs.access)(path)
  } catch (err) {
    throw new Error('No staged commits ready to be pushed')
  }

  const contents = _readStagedFile(path)

  const exists = await _hasBeenCommitted(contents, proxy)

  const mtData = _getWriteData(0, contents, exists)
  const msData = _getWriteData(1, contents, exists)

  let owner = getDocumentOwner(ddo, true)
  owner = `${AID_PREFIX}${owner}`
  const acct = await account.load({ did: owner, password })
  let result = await storage.write({
    mtData,
    msData,
    account: acct,
    to: proxy
  }, estimate, exists)

  if (estimate) {
    if (0 < price) {
      const setPriceGasCost = await setPrice({
        did,
        password,
        price,
        keyringOpts,
        estimate: true
      })
      result = Number(result) + Number(setPriceGasCost)
    }
    return result.toString()
  }

  await _deleteStagedFile(path)

  if (0 < price) {
    await setPrice({
      did, password, price, keyringOpts
    })
  }

  return result
}

function hasStaged(did) {
  const path = resolve(createAFSKeyPath(did), STAGED_FILE)
  try {
    fs.accessSync(path)
    return true
  } catch (err) {
    return false
  }
}

function writeToStaged({
  did,
  fileIndex,
  offset,
  data
} = {}) {
  const path = generateStagedPath(did)
  _writeStagedFile({
    fileIndex,
    offset,
    data,
    path
  })
}

function readFromStaged({
  did,
  fileIndex,
  offset = 0
} = {}) {
  const path = generateStagedPath(did)
  const contents = _readStagedFile(path)
  fileIndex = _getFilenameByIndex(fileIndex)

  let result
  if (contents[fileIndex] && contents[fileIndex][offset]) {
    result = contents[fileIndex][offset]
  }
  return result
}

function generateStagedPath(did) {
  const path = resolve(createAFSKeyPath(did), STAGED_FILE)
  try {
    fs.accessSync(path)
  } catch (err) {
    _makeStagedFile(path)
  }
  return path
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

function _readStagedFile(path) {
  const contents = fs.readFileSync(path, 'utf8')
  return JSON.parse(contents)
}

function _writeStagedFile({
  fileIndex,
  offset,
  data,
  path
} = {}) {
  let json = {}
  try {
    fs.accessSync(path)
    json = _readStagedFile(path)
  } catch (err) {
    fs.writeFileSync(path, '')
  }

  const hex = data.toString('hex')

  const filename = _getFilenameByIndex(fileIndex)
  if (filename) {
    if (!json[filename]) json[filename] = {}
    json[filename][offset] = hex
    const jsonString = JSON.stringify(json)
    fs.writeFileSync(path, jsonString)
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
  if (index === METADATA_TREE_INDEX) {
    return METADATA_TREE_NAME
  } else if (index === METADATA_SIGNATURES_INDEX) {
    return METADATA_SIGNATURES_NAME
  }
  debug('index not recognized', index)
  return null
}

module.exports = {
  commit,
  hasStaged,
  writeToStaged,
  readFromStaged,
  generateStagedPath
}
