const test = require('ava')
const { writeIdentity } = require('ara-identity/util')
const context = require('ara-context')()
const aid = require('ara-identity')
const { create } = require('../create')
const { kAidPrefix } = require('../constants')

const {
  kTestOwnerDid,
  kTestOwnerDidNoMethod,
  kPassword: password
} = require('./_constants')

const getDid = (t) => {
  const { did } = t.context
  return did
}

test.before(async (t) => {
  // create owner identity
  const identity = await aid.create({ context, password })
  await writeIdentity(identity)
  let { publicKey } = identity
  publicKey = publicKey.toString('hex')
  t.context = { did: publicKey }
})

test('create() valid id', async (t) => {
  const owner = `${kAidPrefix}${getDid(t)}`
  // create AFS
  const { afs } = await create({ owner, password })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const { afs: resolvedAfs } = await create({ did, password })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() valid id (no method)', async (t) => {
  const owner = getDid(t)
  // create AFS
  const { afs } = await create({ owner, password })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const { afs: resolvedAfs } = await create({ did, password })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() valid id (readonly)', async (t) => {
  // create AFS
  const { afs } = await create({ owner: kTestOwnerDid, password })
  t.true('object' === typeof afs)
  const { did } = afs

  // resolve AFS readonly
  const { afs: resolvedAfs } = await create({ did })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() invalid id (wrong method)', async (t) => {
  const idWrongMethod = `did:littlstar:${kTestOwnerDidNoMethod}`

  await t.throws(create({ owner: idWrongMethod, password }), TypeError, 'Expecting a DID URI with an "ara" method.')
  await t.throws(create({ did: idWrongMethod, password }), TypeError, 'Expecting a DID URI with an "ara" method.')
})

test('create() invalid id (correct method, invalid id)', async (t) => {
  const idCorrectMethod = 'did:ara:abcd'

  await t.throws(create({ owner: idCorrectMethod, password }), Error, 'ara-filesystem.create: Unable to resolve owner DID')
  await t.throws(create({ did: idCorrectMethod, password }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() invalid id (no method, invalid id)', async (t) => {
  const idNoMethod = 'abcd'

  await t.throws(create({ owner: idNoMethod, password }), TypeError, 'ara-filesystem.create: Unable to resolve owner DID')
  await t.throws(create({ did: idNoMethod, password }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() no id', async (t) => {
  await t.throws(create({ owner: '', password }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
  await t.throws(create({ did: '', password }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})

test('create() null id', async (t) => {
  await t.throws(create({ owner: null, password }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
  await t.throws(create({ did: null, password }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})

test('create() no password', async (t) => {
  await t.throws(create({ owner: kTestOwnerDid }), TypeError, 'ara-filesystem.create: Expecting non-empty password.')
})

test('create() incorrect password', async (t) => {
  const wrongPass = 'abcd'
  await t.throws(create({ owner: kTestOwnerDid, password: wrongPass }), Error, 'ara-filesystem.create: incorrect password.')
  await t.throws(create({ did: kTestOwnerDid, password: wrongPass }), Error, 'ara-filesystem.create: incorrect password.')
})
