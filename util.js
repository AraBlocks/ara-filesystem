const storage = require('ara-contracts/storage')
const ss = require('ara-secret-storage')
const { create } = require('./create')

const {
  METADATA_SIGNATURES_INDEX,
  SIGNATURES_WRITE_LENGTH,
  HEADER_LENGTH,
} = require('./constants')

const {
  getProxyAddress,
  proxyExists
} = require('ara-contracts/registry')

const {
  blake2b,
  keyPair,
  randomBytes: cryptoRandomBytes
} = require('ara-crypto')

async function isUpdateAvailable(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('Expecting DID to be non-empty string')
  }

  const {
    keyringOpts = {},
    did
  } = opts

  let buf
  try {
    const { afs } = await create({ did, keyringOpts })
    const localVersion = afs.partitions.home.version
    const updateVersion = localVersion + 1
    await afs.close()

    // offset to read from bc to see if update is available
    const offset = HEADER_LENGTH + (updateVersion * SIGNATURES_WRITE_LENGTH)

    if (!(await proxyExists(did))) {
      return false
    }

    const address = await getProxyAddress(did)
    buf = await storage.read({
      fileIndex: METADATA_SIGNATURES_INDEX,
      address,
      offset
    })
  } catch (err) {
    throw err
  }

  return null !== buf
}

function generateKeypair(password) {
  const passHash = blake2b(Buffer.from(password))
  const { publicKey, secretKey } = keyPair(passHash)
  return { publicKey, secretKey }
}

function encrypt(value, opts) {
  return ss.encrypt(value, opts)
}

function decrypt(value, opts) {
  const keystore = JSON.parse(value.keystore)
  return ss.decrypt(keystore, opts)
}

function randomBytes(size) {
  return cryptoRandomBytes(size)
}

function encryptJSON(json, password) {
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

function decryptJSON(keystore, password) {
  const { secretKey } = generateKeypair(password)
  const encryptionKey = Buffer.allocUnsafe(16).fill(secretKey.slice(0, 16))
  const decryptedJSON = decrypt({ keystore }, { key: encryptionKey })

  secretKey.fill(0)
  encryptionKey.fill(0)

  return decryptedJSON
}

module.exports = {
  isUpdateAvailable,
  generateKeypair,
  proxyExists,
  encryptJSON,
  decryptJSON,
  randomBytes,
  encrypt,
  decrypt,
}
