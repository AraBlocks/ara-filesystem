const { kPassword: password } = require('./_constants')
const { writeIdentity } = require('ara-identity/util')
const context = require('ara-context')()
const { create } = require('../create')
const metadata = require('../metadata')
const aid = require('ara-identity')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const getDid = t => t.context.did

test.before(async (t) => {
  // create owner identity
  const identity = await aid.create({ context, password })
  await writeIdentity(identity)
  const { publicKey } = identity

  // create afs
  const { afs } = await create({ owner: publicKey.toString('hex'), password })
  const { did } = afs
  t.context = { did }
})

test('writeFile(opts) invalid opts', async (t) => {
  const did = getDid(t)
  await t.throws(metadata.writeFile(), TypeError)
  await t.throws(metadata.writeFile({ }), TypeError)
  await t.throws(metadata.writeFile({ did: null }), TypeError)
  await t.throws(metadata.writeFile({ did: 1234 }), TypeError)
  await t.throws(metadata.writeFile({ did }), TypeError)
  await t.throws(metadata.writeFile({ did, filepath: '' }), TypeError)
})

test('writeFile(opts) file errors', async (t) => {
  const did = getDid(t)
  await t.throws(metadata.writeFile({ did, filepath: 'invalid.json' }), Error)

  const invalidJSON = '{name:"ara"}'
  await pify(fs.writeFile)('invalid.json', invalidJSON)
  await t.throws(metadata.writeFile({ did, filepath: 'invalid.json' }), Error)
})

test('writeFile(opts) valid write', async (t) => {
  const did = getDid(t)

  const validJSON = '{"name":"ara"}'
  await pify(fs.writeFile)('valid.json', validJSON)
  const contents = await metadata.writeFile({ did, filepath: 'valid.json' })
  t.is(validJSON, JSON.stringify(contents))
})

test('writeKey(opts) invalid opts', async (t) => {
  const did = getDid(t)
  await t.throws(metadata.writeKey(), TypeError)
  await t.throws(metadata.writeKey({ }), TypeError)
  await t.throws(metadata.writeKey({ did: null }), TypeError)
  await t.throws(metadata.writeKey({ did: 1234 }), TypeError)
  await t.throws(metadata.writeKey({ did }), TypeError)
  await t.throws(metadata.writeKey({ did, key: 1234 }))
  await t.throws(metadata.writeKey({ did, key: 'my_key' }), TypeError)
})

test('writeKey(opts) valid key write', async (t) => {
  const did = getDid(t)
  const contents = await metadata.writeKey({ did, key: 'my_key', value: 1234 })
  t.true(contents.hasOwnProperty('my_key') && 1234 === contents.my_key)
})

test('readKey(opts) invalid opts', async (t) => {
  const did = getDid(t)
  await t.throws(metadata.writeKey(), TypeError)
  await t.throws(metadata.writeKey({ }), TypeError)
  await t.throws(metadata.writeKey({ did: null }), TypeError)
  await t.throws(metadata.writeKey({ did: 1234 }), TypeError)
  await t.throws(metadata.writeKey({ did }), TypeError)
  await t.throws(metadata.writeKey({ did, key: 1234 }))
})

test('readKey(opts) valid key read', async (t) => {
  const did = getDid(t)
  await metadata.writeKey({ did, key: 'my_key', value: 1234 })

  const value = await metadata.readKey({ did, key: 'my_key' })
  t.is(value, 1234)
})

test('delKey(opts) invalid opts', async (t) => {
  const did = getDid(t)
  await t.throws(metadata.writeKey(), TypeError)
  await t.throws(metadata.writeKey({ }), TypeError)
  await t.throws(metadata.writeKey({ did: null }), TypeError)
  await t.throws(metadata.writeKey({ did: 1234 }), TypeError)
  await t.throws(metadata.writeKey({ did }), TypeError)
  await t.throws(metadata.writeKey({ did, key: 1234 }))
})

test('clear(opts) invalid opts', async (t) => {
  await t.throws(metadata.clear(), TypeError)
  await t.throws(metadata.clear({ }), TypeError)
  await t.throws(metadata.clear({ did: 1234 }), TypeError)
})

test('clear(opts) valid clear', async (t) => {
  const did = getDid(t)
  await t.throws(metadata.clear({ did }), Error)

  await metadata.writeKey({ did, key: 'key1', value: 1 })
  await metadata.clear({ did })

  const file = await metadata.readFile(did)
  t.deepEqual(file, {})
})

test('readFile(did) invalid did', async (t) => {
  await t.throws(metadata.readFile(), TypeError)
  await t.throws(metadata.readFile(1234), TypeError)
})

test('readFile(did) valid file read', async (t) => {
  const did = getDid(t)
  const expected = JSON.parse('{"key1":1}')
  await metadata.writeKey({ did, key: 'key1', value: 1 })

  const result = await metadata.readFile(did)
  t.deepEqual(expected, result)
})

test.after(() => {
  fs.unlinkSync('invalid.json')
  fs.unlinkSync('valid.json')
})
