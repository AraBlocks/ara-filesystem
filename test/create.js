const test = require('ava')
const { create } = require('../create')

const {
  kTestOwnerDid,
  kTestOwnerDidNoMethod,
  kPassword
} = require('./_constants')


test('create() valid id', async (t) => {
  // create AFS
  const { afs } = await create({ owner: kTestOwnerDid, password: kPassword })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const { afs: resolvedAfs } = await create({ did, password: kPassword })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() valid id (no method)', async (t) => {
  // create AFS
  const { afs } = await create({ owner: kTestOwnerDidNoMethod, password: kPassword })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const { afs: resolvedAfs } = await create({ did, password: kPassword })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() invalid id (wrong method)', async (t) => {
  const idWrongMethod = `did:littlstar:${kTestOwnerDidNoMethod}`

  await t.throws(create({ owner: idWrongMethod, password: kPassword }), TypeError, 'Expecting a DID URI with an "ara" method.')
  await t.throws(create({ did: idWrongMethod, password: kPassword }), TypeError, 'Expecting a DID URI with an "ara" method.')
})

test('create() invalid id (correct method, invalid id)', async (t) => {
  const idCorrectMethod = 'did:ara:abcd'

  await t.throws(create({ owner: idCorrectMethod, password: kPassword }), TypeError, 'ara-filesystem.create: Unable to resolve owner DID')
  await t.throws(create({ did: idCorrectMethod, password: kPassword }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() invalid id (no method, invalid id)', async (t) => {
  const idNoMethod = 'abcd'

  await t.throws(create({ owner: idNoMethod, password: kPassword }), TypeError, 'ara-filesystem.create: Unable to resolve owner DID')
  await t.throws(create({ did: idNoMethod, password: kPassword }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() no id', async (t) => {
  await t.throws(create({ owner: '', password: kPassword }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
  await t.throws(create({ did: '', password: kPassword }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})

test('create() null id', async (t) => {
  await t.throws(create({ owner: null, password: kPassword }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
  await t.throws(create({ did: null, password: kPassword }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})

test('create() no password', async (t) => {
  await t.throws(create({ owner: kTestOwnerDid }), TypeError, 'ara-filesystem.create: Expecting non-empty password.')
  await t.throws(create({ did: kTestOwnerDid }), TypeError, 'ara-filesystem.create: Expecting non-empty password.')
})

test('create() incorrect password', async (t) => {
  const wrongPass = 'abcd'
  
  await t.throws(create({ owner: kTestOwnerDid, password: wrongPass }), Error, 'ara-filesystem.create: incorrect password.')
  await t.throws(create({ did: kTestOwnerDid, password: wrongPass }), Error, 'ara-filesystem.create: incorrect password.')
})
