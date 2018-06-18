/* eslint quotes: "off" */

const test = require('ava')
const { create } = require('../create')
const { kTestDid } = require('./_constants')

test("create(did)", async (t) => {
  await t.throws(create(), TypeError, "did must be provided")
  await t.throws(create(1234), TypeError, "did must be string")

  const afs = await create(kTestDid)
  t.true('object' === typeof afs && null !== afs.ddo)
})
