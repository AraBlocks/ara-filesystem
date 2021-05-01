const { PASSWORD: password, AFS_PASSWORD: afsPassword } = require('./_constants')
const metadata = require('../metadata')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  mirrorIdentity,
  createAFS,
  cleanup
} = require('./_util')

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
  t.context = await createAFS(t)
})

test.after(async (t) => {
  await cleanup(t)
})

test.serial('writeFile(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeFile(), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeFile({ }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeFile({ did: null }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeFile({ did: 1234 }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeFile({ did }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeFile({ did, filepath: '' }), { instanceOf: TypeError })
})

test.serial('writeFile(opts) file errors', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeFile({
    did, password, filepath: 'invalid.json', afsPassword
  }), { instanceOf: Error })

  const invalidJSON = '{name:"ara"}'
  await pify(fs.writeFile)('invalid.json', invalidJSON)
  await t.throwsAsync(metadata.writeFile({
    did, password, filepath: 'invalid.json', afsPassword
  }), { instanceOf: Error })
})

test.serial('writeFile(opts) valid write', async (t) => {
  const { did } = getAFS(t)

  const validJSON = '{"name":"ara"}'
  await pify(fs.writeFile)('valid.json', validJSON)
  const contents = await metadata.writeFile({
    did, password, filepath: 'valid.json', afsPassword
  })
  t.is(validJSON, JSON.stringify(contents))
})

test.serial('writeKey(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeKey(), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did: null }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did: 1234 }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did, key: 1234 }), { instanceOf: Error })
  await t.throwsAsync(metadata.writeKey({ did, key: 'my_key' }), { instanceOf: TypeError })
})

test.serial('writeKey(opts) valid key write', async (t) => {
  const { did } = getAFS(t)
  const contents = await metadata.writeKey({
    did, password, key: 'my_key', value: 1234, afsPassword
  })
  t.true(Object.prototype.hasOwnProperty.call(contents, 'my_key') && 1234 === contents.my_key)
})

test.serial('writeKeys(opts) valid key write', async (t) => {
  const { did } = getAFS(t)
  const keys = {
    name: 'test_name',
    number: 1234,
    url: 'test_url.com'
  }

  let contents = await metadata.writeKeys({
    did, password, keys, afsPassword
  })
  t.true(Object.prototype.hasOwnProperty.call(contents, 'name') && keys.name === contents.name)
  t.true(Object.prototype.hasOwnProperty.call(contents, 'number') && keys.number === contents.number)
  t.true(Object.prototype.hasOwnProperty.call(contents, 'url') && keys.url === contents.url)

  contents = await metadata.readFile({ did })
  t.true(Object.prototype.hasOwnProperty.call(contents, 'name') && keys.name === contents.name)
  t.true(Object.prototype.hasOwnProperty.call(contents, 'number') && keys.number === contents.number)
  t.true(Object.prototype.hasOwnProperty.call(contents, 'url') && keys.url === contents.url)
})

test.serial('readKey(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeKey(), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did: null }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did: 1234 }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did, key: 1234 }), { instanceOf: Error })
})

test.serial('readKey(opts) valid key read', async (t) => {
  const { did } = getAFS(t)
  await metadata.writeKey({
    did, password, key: 'my_key', value: 1234, afsPassword
  })

  const value = await metadata.readKey({ did, key: 'my_key' })
  t.is(value, 1234)
})

test.serial('delKey(opts) invalid opts', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(metadata.writeKey(), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did: null }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did: 1234 }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.writeKey({ did, key: 1234 }), { instanceOf: Error })
})

test.serial('clear(opts) invalid opts', async (t) => {
  await t.throwsAsync(metadata.clear(), { instanceOf: TypeError })
  await t.throwsAsync(metadata.clear({ }), { instanceOf: TypeError })
  await t.throwsAsync(metadata.clear({ did: 1234 }), { instanceOf: TypeError })
})

test.serial('clear(opts) valid clear', async (t) => {
  const { did } = getAFS(t)
  await metadata.writeKey({
    did, password, key: 'key1', value: 1, afsPassword
  })
  await metadata.clear({ did, password, afsPassword })

  const file = await metadata.readFile({ did })
  t.deepEqual(file, {})
})

test.serial('readFile(did) invalid did', async (t) => {
  await t.throwsAsync(metadata.readFile(), { instanceOf: TypeError })
  await t.throwsAsync(metadata.readFile({ did: 1234 }), { instanceOf: TypeError })
})

test.serial('readFile(did) valid file read', async (t) => {
  const { did } = getAFS(t)
  await metadata.clear({ did, password, afsPassword })

  const expected = JSON.parse('{"key1":1}')
  await metadata.writeKey({
    did, password, key: 'key1', value: 1, afsPassword
  })

  const result = await metadata.readFile({ did })
  t.deepEqual(expected, result)
})

test.serial('readFile(did) empty file', async (t) => {
  const { did } = getAFS(t)
  await metadata.clear({ did, password, afsPassword })

  const result = await metadata.readFile({ did })
  t.deepEqual({}, result)
})

test.after(() => {
  fs.unlinkSync('invalid.json')
  fs.unlinkSync('valid.json')
})
