/* eslint quotes: "off" */

const test = require('ava')
const aid = require('../aid')
const { kTestDid, kPassword } = require('./_constants')

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

