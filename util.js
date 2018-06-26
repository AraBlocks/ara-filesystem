const { 
  blake2b, keyPair, 
  encrypt: cryptoEncrypt, 
  decrypt: cryptoDecrypt, 
  randomBytes: cryptoRandomBytes } = require('ara-crypto')

function generateKeypair(password) {
  const passHash = blake2b(Buffer.from(password))

  return { publicKey, secretKey } = keyPair(passHash)
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

module.exports = {
  generateKeypair,
  encrypt,
  decrypt,
  randomBytes
}
