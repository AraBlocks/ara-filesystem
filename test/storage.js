/* eslint quotes: off */

const test = require('ava')
const RandomAccessStorage = require('random-access-storage')
const RandomAccessFile = require('random-access-file')
const { createAFSKeyPath } = require('../key-path')

const {
  TEST_DID
} = require('./_constants')

const {
  resolveBufferIndex,
  defaultStorage
} = require('../storage')

test("resolveBufferIndex() invalid path", (t) => {
  t.throws(() => resolveBufferIndex(), TypeError, `Path must be non-empty string`)
  t.throws(() => resolveBufferIndex(111), TypeError, "Path must be non-empty string")
  t.throws(() => resolveBufferIndex('metadataTree'), Error, "Path is not formatted properly")
})

test("resolveBufferIndex() valid params", (t) => {
  let result = resolveBufferIndex('metadata/tree')
  t.is(result, 0)

  result = resolveBufferIndex('metadata/signatures')
  t.is(result, 1)
})

test("defaultStorage() validate return values", (t) => {
  const storage = defaultStorage(TEST_DID, true)
  const path = createAFSKeyPath(TEST_DID)

  let result = storage('metadata/tree', null, `${path}/home`)
  t.true(result.constructor === RandomAccessStorage)

  result = storage('metadata/signatures', null, `${path}/home`)
  t.true(result.constructor === RandomAccessStorage)

  result = storage('metadata/tree', null, path)
  t.true(result.constructor === RandomAccessFile)

  result = storage('metadata/signatures', null, path)
  t.true(result.constructor === RandomAccessFile)
})

test("defaultStorage() invalid params", (t) => {
  t.throws(() => defaultStorage(), TypeError)
  t.throws(() => defaultStorage({}), TypeError)
  t.throws(() => defaultStorage('1234', false), Error)
})
