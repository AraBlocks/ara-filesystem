const ss = require('ara-secret-storage')
const { createIdentityKeyPath } = require('./key-path')
const { toHex } = require('ara-identity/util')
const { secrets } = require('ara-network')
const { web3 } = require('ara-context')()
const aid = require('./aid')
const path = require('path')
const pify = require('pify')
const fs = require('fs')

const {
  blake2b,
  keyPair,
  randomBytes: cryptoRandomBytes
} = require('ara-crypto')

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

async function loadSecrets(key) {
  const { public: pub } = await secrets.load({ key, public: true })
  return pub.keystore
}

function getDocumentOwner(ddo, shouldNormalize = true) {
  if (!ddo || null == ddo || 'object' !== typeof ddo) {
    throw new TypeError('Expecting DDO')
  }

  let pk
  if (ddo.authentication) {
    pk = ddo.authentication[0].authenticationKey
  } else if (ddo.didDocument) {
    pk = ddo.didDocument.authentication[0].authenticationKey
  }

  const suffixLength = kOwnerSuffix.length
  const id = pk.slice(0, pk.length - suffixLength)

  return shouldNormalize ? normalize(id) : id
}

function getDocumentKeyHex(ddo) {
  if (!ddo || null == ddo || 'object' !== typeof ddo) {
    throw new TypeError('Expecting DDO')
  }

  let pk
  if (ddo.publicKey) {
    pk = ddo.publicKey[0].publicKeyHex
  } else if (ddo.didDocument) {
    pk = ddo.didDocument.publicKey[0].publicKeyHex
  }

  return pk
}

async function isCorrectPassword({
  ddo = {},
  password = ''
} = {}) {
  if (!password || 'string' !== typeof password) {
    throw new TypeError('Password must be non-empty string.')
  }

  if (!ddo || 'object' !== typeof ddo || 0 === ddo.publicKey.length) {
    throw new TypeError('Expecting DDO to be object with valid publicKey array.')
  }

  const { publicKeyHex } = ddo.publicKey[0]

  password = blake2b(Buffer.from(password))
  const identityPath = path.resolve(createIdentityKeyPath(ddo), 'keystore/ara')

  let secretKey
  try {
    const keys = JSON.parse(await pify(fs.readFile)(identityPath, 'utf8'))
    secretKey = cryptoDecrypt(keys, { key: password.slice(0, 16) })
  } catch (err) {
    return false
  }

  const publicKey = secretKey.slice(32).toString('hex')
  return publicKeyHex === publicKey
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
  generateKeypair,
  encrypt,
  decrypt,
  encryptJSON,
  decryptJSON,
  randomBytes
}
