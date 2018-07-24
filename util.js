const { secrets } = require('ara-network')
const { create } = require('ara-identity/did')
const { web3 } = require('ara-context')()
const aid = require('./aid')

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

function getDocumentOwner(ddo, shouldValidate = true) {
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

  return shouldValidate ? normalize(id) : id
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
  didUri = normalize(didUri)

  let result = true
  if (owner) {
    owner = normalize(owner)
    result = didUri === owner
  } else {
    ddo = ddo || null
    if (!ddo) {
      const keystore = await loadSecrets(kResolverKey)
      ddo = await aid.resolve(did, { key: kResolverKey, keystore })
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

function hashIdentity(did) {
  return blake2b(Buffer.from(did)).toString('hex')
}

function normalize(did) {
  if (hasDIDMethod(did)) {
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

async function validate({
  password,
  label = '',
  did,
  owner
} = {}) {
  if (label) {
    label = `.${label}`
  }

  if (did && owner) {
    throw new Error(`ara-filesystem${label}: Expecting an AFS DID or an owner DID, but not both`)
  }

  if (owner) {
    did = owner
  }

  if (!did || 'string' !== typeof did) {
    throw new TypeError(`ara-filesystem${label}: Expecting non-empty DID`)
  }

  try {
    did = normalize(did)
  } catch (err) {
    throw err
  }

  const ddo = await resolve(did)

  if (null === ddo || 'object' !== typeof ddo) {
    throw new TypeError(`ara-filesystem${label}: Unable to resolve owner DID`)
  }

  const writable = Boolean(password) || Boolean(owner)
  if (writable) {
    if ('string' !== typeof password) {
      throw new TypeError(`ara-filesystem${label}: Expecting non-empty string for password`)
    }

    const passwordCorrect = owner
      ? await isCorrectPassword({ owner, ddo, password })
      : await isCorrectPassword({ did, ddo, password })
    if (!passwordCorrect) {
      throw new Error(`ara-filesystem${label}: Incorrect password`)
    }
  }

  return {
    did,
    ddo
  }
}

async function resolve(did) {
  const keystore = await loadSecrets(kResolverKey)
  const ddo = await aid.resolve(did, { key: kResolverKey, keystore })
  return ddo
}

function getDeployedContract(abi, address) {
  return new web3.eth.Contract(abi, address)
}

async function getAfsId(did, mnemonic) {
  const keystore = await loadSecrets(kResolverKey)
  const afsDdo = await aid.resolve(did, { key: kResolverKey, keystore })
  const owner = getDocumentOwner(afsDdo)
  return aid.create(mnemonic, owner)
}

function hasDIDMethod(did) {
  return 0 === did.indexOf(kDidPrefix)
}

module.exports = {
  generateKeypair,
  encrypt,
  decrypt,
  encryptJSON,
  decryptJSON,
  randomBytes,
  loadSecrets,
  normalize,
  getDocumentOwner,
  getDocumentKeyHex,
  isCorrectPassword,
  hashIdentity,
  validate,
  getDeployedContract,
  getAfsId,
  hasDIDMethod
}
