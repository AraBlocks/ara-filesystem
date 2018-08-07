const test = require('ava')
const context = require('ara-context')()
const aid = require('ara-identity')
const fs = require('fs')
const pify = require('pify')
const { resolve } = require('path')
const { create, unarchive, add } = require('../')
const { writeIdentity } = require('ara-identity/util')
const { kPassword: password } = require('./_constants')

const getDid = t => t.context.did
const kTestFilename = 'hello.txt'

test.before(async (t) => {
  const identity = await aid.create({ context, password })
  await writeIdentity(identity)
  let { publicKey } = identity
  publicKey = publicKey.toString('hex')
  const { afs } = await create({ owner: publicKey, password })
  t.context = { did: afs.did }
})

test.serial('unarchive() invalid opts', async (t) => {
  const did = getDid(t)

  // validate DID
  await t.throws(unarchive(), TypeError)
  await t.throws(unarchive({ }), TypeError)
  await t.throws(unarchive({ did: 1234 }), TypeError)

  // validate password
  await t.throws(unarchive({ did }), TypeError)
  await t.throws(unarchive({ did, password: 'wrongPass' }), Error)

  // validate path
  await t.throws(unarchive({ did, password, path: 123 }), TypeError)
})

test.serial('unarchive() empty AFS', async (t) => {
  const did = getDid(t)
  await t.throws(unarchive({ did, password }), Error)
})

test.serial('unarchive() valid unarchive', async (t) => {
  const did = getDid(t)

  // create test file and add to test AFS
  await pify(fs.writeFile)(kTestFilename, 'Hello World!')
  await add({ did, password, paths: [ kTestFilename ] })

  // test unarchive to cwd
  await unarchive({ did, password })
  await t.notThrows(pify(fs.access)(kTestFilename))
  const result = await pify(fs.readFile)(kTestFilename, 'utf8')
  t.is(result, 'Hello World!')
})

test.after((t) => {
  fs.unlinkSync(kTestFilename)
})
