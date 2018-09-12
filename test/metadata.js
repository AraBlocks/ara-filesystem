const { createAFSKeyPath } = require('../key-path')
const { mirrorIdentity } = require('./_util')
const { create } = require('../create')
const metadata = require('../metadata')
const aid = require('ara-identity')
const rimraf = require('rimraf')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const { PASSWORD: password } = require('./_constants')

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  const { did, ddo } = await mirrorIdentity()
  t.context = { ddo, did }
  let afs
  try {
    // eslint-disable-next-line semi
    ({ afs } = await create({ owner: did, password, ddo }));
  } catch (err) {
    console.log(err)
  }
  t.context = { afs, idPath: aid.createIdentityKeyPath(afs.ddo), afsPath: createAFSKeyPath(afs.did) }
})

test.after(async (t) => {
  const { idPath, afsPath } = t.context
  if (idPath && afsPath) {
    await pify(rimraf)(idPath)
    await pify(rimraf)(afsPath)
  }
})

test('writeFile(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeFile(), TypeError)
  await t.throwsAsync(metadata.writeFile({ }), TypeError)
  await t.throwsAsync(metadata.writeFile({ did: null }), TypeError)
  await t.throwsAsync(metadata.writeFile({ did: 1234 }), TypeError)
  await t.throwsAsync(metadata.writeFile({ did }), TypeError)
  await t.throwsAsync(metadata.writeFile({ did, filepath: '' }), TypeError)
})

test('writeFile(opts) file errors', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeFile({ did, filepath: 'invalid.json' }), Error)

  const invalidJSON = '{name:"ara"}'
  await pify(fs.writeFile)('invalid.json', invalidJSON)
  await t.throwsAsync(metadata.writeFile({ did, filepath: 'invalid.json' }), Error)
})

test('writeFile(opts) valid write', async (t) => {
  const { did } = getAFS(t)

  const validJSON = '{"name":"ara"}'
  await pify(fs.writeFile)('valid.json', validJSON)
  const contents = await metadata.writeFile({ did, filepath: 'valid.json' })
  t.is(validJSON, JSON.stringify(contents))
})

test('writeKey(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeKey(), TypeError)
  await t.throwsAsync(metadata.writeKey({ }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did: null }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did: 1234 }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did, key: 1234 }))
  await t.throwsAsync(metadata.writeKey({ did, key: 'my_key' }), TypeError)
})

test('writeKey(opts) valid key write', async (t) => {
  const { did } = getAFS(t)
  const contents = await metadata.writeKey({ did, key: 'my_key', value: 1234 })
  t.true(Object.prototype.hasOwnProperty.call(contents, 'my_key') && 1234 === contents.my_key)
})

test('readKey(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeKey(), TypeError)
  await t.throwsAsync(metadata.writeKey({ }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did: null }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did: 1234 }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did, key: 1234 }))
})

test('readKey(opts) valid key read', async (t) => {
  const { did } = getAFS(t)
  await metadata.writeKey({ did, key: 'my_key', value: 1234 })

  const value = await metadata.readKey({ did, key: 'my_key' })
  t.is(value, 1234)
})

test('delKey(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeKey(), TypeError)
  await t.throwsAsync(metadata.writeKey({ }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did: null }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did: 1234 }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did }), TypeError)
  await t.throwsAsync(metadata.writeKey({ did, key: 1234 }))
})

test('clear(opts) invalid opts', async (t) => {
  await t.throwsAsync(metadata.clear(), TypeError)
  await t.throwsAsync(metadata.clear({ }), TypeError)
  await t.throwsAsync(metadata.clear({ did: 1234 }), TypeError)
})

test('clear(opts) valid clear', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.clear({ did }), Error)

  await metadata.writeKey({ did, key: 'key1', value: 1 })
  await metadata.clear({ did })

  const file = await metadata.readFile({ did })
  t.deepEqual(file, {})
})

test('readFile(did) invalid did', async (t) => {
  await t.throwsAsync(metadata.readFile(), TypeError)
  await t.throwsAsync(metadata.readFile({ did: 1234 }), TypeError)
})

test('readFile(did) valid file read', async (t) => {
  const { did } = getAFS(t)
  const expected = JSON.parse('{"key1":1}')
  await metadata.writeKey({ did, key: 'key1', value: 1 })

  const result = await metadata.readFile({ did })
  t.deepEqual(expected, result)
})

test.after(() => {
  fs.unlinkSync('invalid.json')
  fs.unlinkSync('valid.json')
})
