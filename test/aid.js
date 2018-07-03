/* eslint quotes: "off" */

const test = require('ava')
const aid = require('../aid')
const { kTestDid, kPassword } = require('./_constants')

// empty seed
// seed not string
test("create() invalid seed", async (t) => {

})

// empty pk
// incorrect pk length
// pk not string
test("create() invalid publicKey", async (t) => {

})

// create did with correct ddo returned
// make sure authetication is in ddo
test("create() valid params", async (t) => {

})

// invalid identity (not valid did)
test("archive() invalid identity", async (t) => {

})

// invalid opts
  // doesn't contain key
  // doesn't contain keystore
test("archive() invalid opts", async (t) => {

})

// valid identity and opts, make sure nothing was thrown
test("archive() valid params", async (t) => {

})

// invalid identity (not valid did)
test("resolve() invalid did", async (t) => {

})

// invalid opts
  // doesn't contain key
  // doesn't contain keystore
test("resolve() invalid opts", async (t) => {

})

// TODO(ccekelly): old
test("create(publicKey)", async (t) => {
  await t.throws(aid.create(kPassword), TypeError, "publicKey is not non-empty string")
  await t.throws(aid.create(kPassword, kTestDid.slice(32), TypeError, "invalid identifier length"))
  await t.throws(aid.create(kPassword, `did:ara:${kTestDid.slice(32)}`, TypeError, "invalid identifier length"))

  t.true('object' === typeof await aid.create(kPassword, kTestDid))
})

test("archive(identity opts)", async (t) => {
  const identity = await aid.create(kPassword, kTestDid)
  await t.notThrows(aid.archive(identity))
})

test("resolve(did, opts = {})", async (t) => {
  await t.true('object' === typeof await aid.resolve(kTestDid))
})

test("hasDIDMethod(key)", (t) => {
  t.false(aid.hasDIDMethod('1234'))
  t.true(aid.hasDIDMethod('did:ara:1234'))
})

