const debug = require('debug')('ara-filesystem:util')
const { secrets } = require('ara-network')
const { create } = require('ara-identity/did')
const { resolve } = require('./aid')

const {
  blake2b, keyPair,
  encrypt: cryptoEncrypt,
  decrypt: cryptoDecrypt,
  randomBytes: cryptoRandomBytes
} = require('ara-crypto')

const {
  kAidPrefix,
  kDidPrefix,
  kOwnerSuffix,
  kResolverKey
} = require('./constants')

function generateKeypair(password) {
  const passHash = blake2b(Buffer.from(password))
  const { publicKey, secretKey } = keyPair(passHash)
  return { publicKey, secretKey }
}

function encrypt(value, opts) {
  return cryptoEncrypt(value, opts)
}

function decrypt(value, opts) {
  const keystore = JSON.parse(value.keystore)
  return cryptoDecrypt(keystore, opts)
}

function randomBytes(size) {
  return cryptoRandomBytes(size)
}

async function loadSecrets(key) {
  const { public: pub } = await secrets.load({ key, public: true })
  return pub.keystore
}

function validateDid(did) {
  if (0 === did.indexOf(kDidPrefix)) {
    if (0 !== did.indexOf(kAidPrefix)) {
      throw new TypeError('Expecting a DID URI with an "ara" method.')
    } else {
      did = did.substring(kAidPrefix.length)
      if (64 !== did.length) {
        throw new Error('DID is not 64 characters')
      }
    }
  }
  return did
}

function getDocumentOwner(ddo, validate = true) {
  if (!ddo || null == ddo || 'object' !== typeof ddo) {
    throw new TypeError('Expecting DDO')
  }

  const pk = ddo.authentication[0].authenticationKey
  const suffixLength = kOwnerSuffix.length
  const id = pk.slice(0, pk.length - suffixLength)

  return validate ? validateDid(id) : id
}

async function isCorrectPassword({
  did,
  ddo,
  owner,
  password
} = {}) {
  
  if (!password || 'string' !== typeof password) {
    throw new TypeError('Password must be non-empty string.')
  }

  const { publicKey } = generateKeypair(password)
  let { did: didUri } = create(publicKey)
  didUri = validateDid(didUri)

  let result = true
  if (owner) {
    owner = validateDid(owner)
    result = didUri === owner
  } else {
    ddo = ddo || null
    if (!ddo) {
      const keystore = await loadSecrets(kResolverKey)
      ddo = await resolve(did, { key: kResolverKey, keystore })
    }
    const ddoOwner = getDocumentOwner(ddo)
    result = didUri === ddoOwner
  }
  return result
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
  randomBytes,
  loadSecrets,
  validateDid,
  getDocumentOwner,
  isCorrectPassword
}
