/* eslint quotes: "off" */

const test = require('ava')
const aid = require('../aid')
const { loadSecrets } = require('../util')
const { toHex, writeIdentity } = require('ara-identity/util')

const {
  kArchiverKey,
  kResolverKey
} = require('../constants')

const {
  kTestOwnerDid,
  kPassword: password
} = require('./_constants')

test.serial("create() invalid password", async (t) => {
  await t.throws(aid.create(), TypeError, "Password must not-empty string")
  await t.throws(aid.create({ password: 123 }), TypeError, "Password must not-empty string")
})

test.serial("create() invalid owner", async (t) => {
  await t.throws(aid.create({ password }), TypeError, "Public key must not be empty")
  await t.throws(aid.create({ password, owner: kTestOwnerDid.slice(32) }), TypeError, "DID must be 64 chars")
  await t.throws(aid.create({ password, owner: 111 }), TypeError, "Public key must be of type string")
})

test.serial("create() valid params", async (t) => {
  const { did, ddo, mnemonic } = await aid.create({ password, owner: kTestOwnerDid })
  t.true(did && 'object' === typeof did)
  t.true(ddo && 'object' === typeof ddo)
  t.true(mnemonic && 'string' === typeof mnemonic)

  const { authenticationKey } = ddo.authentication[0]
  t.true(authenticationKey.includes(kTestOwnerDid))
})

test.serial("archive() invalid identity", async (t) => {
  await t.throws(aid.archive(), Error, "Expecting identity")
  await t.throws(aid.archive(111), Error, "Expecting identity to be of type string")
})

test.serial("archive() invalid opts", async (t) => {
  const afsId = await aid.create({ password, owner: kTestOwnerDid })
  await t.throws(aid.archive(afsId, { }), Error, "Expecting options object")
})

test.serial("archive() valid params", async (t) => {
  const afsId = await aid.create({ password, owner: kTestOwnerDid })

  const keystore = await loadSecrets(kArchiverKey)
  await t.notThrows(aid.archive(afsId, { key: kArchiverKey, keystore }))
})

test.serial("resolve() invalid did", async (t) => {
  await t.throws(aid.resolve(), TypeError, "Expecting non-empty string")
  await t.throws(aid.resolve(''), TypeError, "Expecting non-empty string")
  await t.throws(aid.resolve(111), TypeError, "Expecting non-empty string")
})

test.serial("resolve() invalid opts", async (t) => {
  const afsId = await aid.create({ password, owner: kTestOwnerDid })
  await t.throws(aid.archive(afsId), Error, "Expecting opts object")
})

test.serial("resolve() valid params", async (t) => {
  const afsId = await aid.create({ password, owner: kTestOwnerDid })

  await writeIdentity(afsId)

  let keystore = await loadSecrets(kArchiverKey)
  await aid.archive(afsId, { key: kArchiverKey, keystore })

  const { publicKey } = afsId
  const did = toHex(publicKey)

  keystore = await loadSecrets(kResolverKey)
  const res = await aid.resolve(did, { key: kResolverKey, keystore })

  t.is(JSON.stringify(res), JSON.stringify(afsId.ddo))
})
