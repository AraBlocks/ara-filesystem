/* eslint quotes: off */

const test = require('ava')
const RandomAccessStorage = require('random-access-storage')
const RandomAccessFile = require('random-access-file')
const { createAFSKeyPath } = require('../key-path')

const {
  kTestDid,
  kPassword: password
} = require('./_constants')

const {
  resolveBufferIndex,
  defaultStorage
} = require('../storage')

// TODO(cckelly): commit.js tests for the most part cover read, write functionality
// if logic changes significantly, write tests here for read, write, stat, del

test("resolveBufferIndex() invalid path", (t) => {
  t.throws(() => resolveBufferIndex(), TypeError, `Path must be non-empty string`)
  t.throws(() => resolveBufferIndex(111), TypeError, "Path must be non-empty string")
  t.throws(() => resolveBufferIndex('metadataTree'), Error, "Path is not formatted properly")
})

test("resolveBufferIndex() valid params", (t) => {
  let result = resolveBufferIndex('content/tree')
  t.is(result, 0)

  result = resolveBufferIndex('content/signatures')
  t.is(result, 1)

  result = resolveBufferIndex('metadata/tree')
  t.is(result, 2)

  result = resolveBufferIndex('metadata/signatures')
  t.is(result, 3)
})

test("defaultStorage() validate return values", (t) => {
  const storage = defaultStorage(kTestDid, password)
  const path = createAFSKeyPath(kTestDid)

  let result = storage('content/tree', null, `${path}/home`)
  t.true(result.constructor === RandomAccessStorage)

  result = storage('content/signatures', null, `${path}/home`)
  t.true(result.constructor === RandomAccessStorage)

  result = storage('metadata/tree', null, path)
  t.true(result.constructor === RandomAccessFile)

  result = storage('metadata/signatures', null, path)
  t.true(result.constructor === RandomAccessFile)
})
