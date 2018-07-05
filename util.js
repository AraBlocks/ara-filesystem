const {
  blake2b, keyPair,
  encrypt: cryptoEncrypt,
  decrypt: cryptoDecrypt,
  randomBytes: cryptoRandomBytes
} = require('ara-crypto')

const {
  kAidPrefix,
  kDidPrefix,
  kOwnerSuffix
} = require('./constants')

const { secrets } = require('ara-network')

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

function getAfsOwner(afs) {
  if (null == afs || 'object' !== typeof afs) {
    throw new TypeError('Expecting an afs')
  }
  const { ddo } = afs

  if (null == ddo || 'object' !== typeof ddo) {
    throw new TypeError('Fatal Error: AFS does not have a DDO')
  }

  const pk = ddo.didDocument.authentication[0].publicKey
  const suffixLength = kOwnerSuffix.length
  const id = pk.slice(0, pk.length - suffixLength)

  return id
}

module.exports = {
  generateKeypair,
  encrypt,
  decrypt,
  randomBytes,
  loadSecrets,
  validateDid,
  getAfsOwner
}
