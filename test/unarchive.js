const { PASSWORD: password } = require('./_constants')
const { resolve } = require('path')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  mirrorIdentity,
  createAFS,
  cleanup
} = require('./_util')

const {
  unarchive,
  add
} = require('../')

const kTestFilename = 'hello.txt'

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
})

test.beforeEach(async (t) => {
  t.context = await createAFS(t)
})

test.afterEach(async (t) => {
  await cleanup(t)
})

test.serial('unarchive() invalid opts', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  // validate DID
  await t.throwsAsync(unarchive(), TypeError)
  await t.throwsAsync(unarchive({ }), TypeError)
  await t.throwsAsync(unarchive({ did: 1234 }), TypeError)

  // validate path
  await t.throwsAsync(unarchive({ did, path: 123 }), TypeError)
})

test.serial('unarchive() empty AFS', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  await t.throwsAsync(unarchive({ did }), Error)
})

test.serial('unarchive() valid unarchive', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  // create test file and add to test AFS
  await pify(fs.writeFile)(resolve(kTestFilename), 'Hello World!')
  await add({ did, password, paths: [ kTestFilename ] })

  // test unarchive to cwd
  await unarchive({ did })
  await t.notThrowsAsync(pify(fs.access)(kTestFilename))
  const result = await pify(fs.readFile)(kTestFilename, 'utf8')
  t.is(result, 'Hello World!')
})

test.after(() => {
  fs.unlinkSync(kTestFilename)
})
