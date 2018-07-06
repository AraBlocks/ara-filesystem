/* eslint quotes: "off" */

const test = require('ava')
const pify = require('pify')
const rimraf = require('rimraf')
const fs = require('fs')
const { kTestDid } = require('./_constants')
const { createAFSKeyPath } = require('../key-path')

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
  await t.notThrows(pify(fs.mkdir)(path))
})

test.after(async () => {
  await pify(rimraf)(createAFSKeyPath(kTestDid))
})
