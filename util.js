const {
  blake2b,
  keyPair,
  encrypt: cryptoEncrypt,
  decrypt: cryptoDecrypt,
  randomBytes: cryptoRandomBytes
} = require('ara-crypto')

function generateKeypair(password) {
  const passHash = blake2b(Buffer.from(password))
  const { publicKey, secretKey } = keyPair(passHash)
  return { publicKey, secretKey }
}

// afs
function encrypt(value, opts) {
  return cryptoEncrypt(value, opts)
}

// afs
function decrypt(value, opts) {
  const keystore = JSON.parse(value.keystore)
  return cryptoDecrypt(keystore, opts)
}

// afs
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

// afs
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
