/* eslint quotes: "off" */

const { createAFSKeyPath } = require('../key-path')
const { kTestDid } = require('./_constants')
const rimraf = require('rimraf')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

test.before(async () => {
  try {
    await pify(rimraf)(createAFSKeyPath(kTestDid))
  } catch (err) {
    console.error(err)
  }
})

test("createAFSKeyPath() invalid id", (t) => {
  t.throws(() => createAFSKeyPath(), TypeError, "Expecting non-empty string")
  t.throws(() => createAFSKeyPath(111), TypeError, "Expecting non-empty string")
})

test("createAFSKeyPath() valid id", async (t) => {
  const path = createAFSKeyPath(kTestDid)
  await t.notThrowsAsync(pify(fs.mkdir)(path))
})

test.after(async () => {
  await pify(rimraf)(createAFSKeyPath(kTestDid))
})
