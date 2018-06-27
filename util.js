const { 
  blake2b, keyPair, 
  encrypt: cryptoEncrypt, 
  decrypt: cryptoDecrypt, 
  randomBytes: cryptoRandomBytes 
} = require('ara-crypto')

const {
  kAidPrefix, 
  kDidPrefix, 
  kResolverKey
} = require('./constants')

const { secrets } = require('ara-network')

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

async function loadSecrets(key) {
  const { public: pub } = await secrets.load({ key, public: true })
  return pub.keystore
}

function validateDid(did) {
  if (0 === did.indexOf(kDidPrefix)) {
    if (0 !== did.indexOf(kAidPrefix)) {
      throw new TypeError('Expecting a DID URI with an "ara" method.')
    } else {
      return did.substring(kAidPrefix.length)
    }
  }
  return did
}

function afsOwner(afs) {
  if (null == afs || 'object' !== typeof afs) {
    throw new TypeError('Expecting an afs')
  }
  const ddo = afs.ddo

  if (null == ddo || 'object' != typeof ddo) {
    throw new TypeError('Fatal Error: AFS does not have a DDO')
  }

  console.dir(ddo)
  return ddo
}

module.exports = {
  generateKeypair,
  encrypt,
  decrypt,
  randomBytes,
  loadSecrets,
  validateDid,
  afsOwner
}
