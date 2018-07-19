/* eslint quotes: "off" */

// TODO(cckelly): archiving seems to be hanging

const test = require('ava')
const aid = require('../aid')
const bip39 = require('bip39')
const { loadSecrets } = require('../util')
const { toHex, writeIdentity } = require('ara-identity/util')

const {
  kArchiverKey,
  kResolverKey
} = require('../constants')

const { kTestDid } = require('./_constants')

test.before((t) => {
  const mnemonic = bip39.generateMnemonic()
  t.context = { mnemonic }
})

test("create() invalid seed", async (t) => {
  await t.throws(aid.create('', 'my_public_key'), TypeError, "Seed must not be null")
  await t.throws(aid.create(111, 'my_public_key'), TypeError, "Seed must be of type string")
})

test("create() invalid publicKey", async (t) => {
  const { context } = t
  await t.throws(aid.create(context.mnemonic, ''), TypeError, "Public key must not be empty")
  await t.throws(aid.create(context.mnemonic, kTestDid.slice(32)), TypeError, "DID must be 64 chars")
  await t.throws(aid.create(context.mnemonic, 111), TypeError, "Public key must be of type string")
})

test("create() valid params", async (t) => {
  const { context } = t
  const { did, ddo } = await aid.create(context.mnemonic, kTestDid)
  t.true(did && 'object' === typeof did)
  t.true(ddo && 'object' === typeof ddo)

  const { authenticationKey } = ddo.authentication[0]
  t.true(authenticationKey.includes(kTestDid))
})

test("archive() invalid identity", async (t) => {
  await t.throws(aid.archive(), Error, "Expecting identity")
  await t.throws(aid.archive(111), Error, "Expecting identity to be of type string")
})

test("archive() invalid opts", async (t) => {
  const { context } = t
  const afsId = await aid.create(context.mnemonic, kTestDid)
  await t.throws(aid.archive(afsId, { }), Error, "Expecting options object")
})

test("archive() valid params", async (t) => {
  const { context } = t
  const afsId = await aid.create(context.mnemonic, kTestDid)

  const keystore = await loadSecrets(kArchiverKey)
  await t.notThrows(aid.archive(afsId, { key: kArchiverKey, keystore }))
})

test("resolve() invalid did", async (t) => {
  await t.throws(aid.resolve(), TypeError, "Expecting non-empty string")
  await t.throws(aid.resolve(''), TypeError, "Expecting non-empty string")
  await t.throws(aid.resolve(111), TypeError, "Expecting non-empty string")
})

test("resolve() invalid opts", async (t) => {
  const { context } = t
  const afsId = await aid.create(context.mnemonic, kTestDid)
  await t.throws(aid.archive(afsId), Error, "Expecting opts object")
})

test("resolve() valid params", async (t) => {
  const { context } = t
  const afsId = await aid.create(context.mnemonic, kTestDid)

  await writeIdentity(afsId)

  let keystore = await loadSecrets(kArchiverKey)
  await aid.archive(afsId, { key: kArchiverKey, keystore })

  const { publicKey } = afsId
  const did = toHex(publicKey)

  keystore = await loadSecrets(kResolverKey)
  const res = await aid.resolve(did, { key: kResolverKey, keystore })

  t.is(JSON.stringify(res), JSON.stringify(afsId.ddo))
})
