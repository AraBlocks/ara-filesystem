/* eslint quotes: "off" */

const test = require('ava')
const rimraf = require('rimraf')
const pify = require('pify')
const fs = require('fs')
const { kTestDid } = require('./_constants')
const { resolve } = require('path')
const { createAFSKeyPath } = require('../key-path')

test("createAFSKeypath(id)", async (t) => {
  t.throws(() => createAFSKeyPath(), TypeError, "id cannot be blank")
  t.throws(() => createAFSKeyPath({ id: 1234 }, TypeError, "id must be a string"))

  const keyPath = createAFSKeyPath(kTestDid)
  t.notThrows(async () => fs.mkdir(keyPath))
})

test.after("cleanup", async () => {
  const path = resolve(require('os').homedir(), '.ara', 'afs', '*')
  await pify(rimraf)(path)
})
