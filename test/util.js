/* eslint quotes: "off" */

const test = require('ava')
const util = require('../util')
const { kTestOwnerDid } = require('./_constants')
const { kResolverKey } = require('../constants')

test("generateKeypair() invalid password", (t) => {
  t.throws(() => util.generateKeypair(), TypeError, "empty password")
  t.throws(() => util.generateKeypair(1234), TypeError, "invalid type for password")
})

test("generateKeypair() validate keypair", (t) => {
  const { publicKey, secretKey } = util.generateKeypair('password')
  t.true(0 < publicKey.length)
  t.true(0 < secretKey.length)
})

test("encrypt() invalid params", (t) => {
  t.throws(() => util.encrypt(), TypeError, "invalid params")  
  t.throws(() => util.encrypt('password'), TypeError, "need opts object")
})

test("encrypt() validate encryption", (t) => {
  // TODO(cckelly)
})

test("decrypt() invalid params", (t) => {
  t.throws(() => util.decrypt(), TypeError, "invalid params")
})


test("decrypt() validate decryption", (t) => {
  // TODO(cckelly)
})

test("randomBytes() validate random bytes", (t) => {
  const bufSize = 16
  const buf = util.randomBytes(bufSize)
  t.true(buf instanceof Buffer)
  t.true(bufSize === buf.length)
})

test("loadSecrets() invalid key", async (t) => {
  await t.throws(util.loadSecrets(), TypeError, "key needs to be a buffer or string")
})

test("loadSecrets() validate returned secrets", async (t) => {
  const { crypto } = await util.loadSecrets(kResolverKey)
  const { ciphertext } = crypto
  t.true(null !== crypto && null !== ciphertext) 
})

test("validateDid() validate DID cases", (t) => {
  const shortDid = 'did:ara:1234567890'
  t.throws(() => util.validateDid(shortDid), Error, "DID must be 64 characters")

  const didWithoutPrefix = 'did:1234567890'
  t.throws(() => util.validateDid(didWithoutPrefix), TypeError, "DID is missing ara prefix")

  t.notThrows(() => util.validateDid(kTestOwnerDid), Error, "DID is not valid")
})
