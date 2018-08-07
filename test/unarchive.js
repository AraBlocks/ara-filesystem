const test = require('ava')
const context = require('ara-context')()
const aid = require('ara-identity')
const { create, unarchive } = require('../')
const { writeIdentity } = require('ara-identity/util')
const { kPassword: password } = require('./_constants')

const getDid = t => t.context.did

test.before(async (t) => {
  const identity = await aid.create({ context, password })
  await writeIdentity(identity)
  let { publicKey } = identity
  publicKey = publicKey.toString('hex')
  const { did } = await create({ owner: publicKey, password })
  t.context = { did }
})

test('unarchive() invalid opts', async (t) => {
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

test('unarchive() valid unarchive', async (t) => {
  const did = getDid(t)

  await unarchive({ did, password })
  t.pass()
})
