const { create } = require('../create')
const test = require('ava')
const { kTestOwnerDid, kTestOwnerDidNoMethod } = require('./_constants')

test('create() valid id', async (t) => {
  // create AFS
  const afs = await create({ owner: kTestOwnerDid })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const resolvedAfs = await create({ did })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() valid id (no method)', async (t) => {
  // create AFS
  const afs = await create({ owner: kTestOwnerDidNoMethod })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const resolvedAfs = await create({ did })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() invalid id (wrong method)', async (t) => {
  const idWrongMethod = 'did:littlstar:' + kTestOwnerDidNoMethod

  await t.throws(create({ owner: idWrongMethod }), TypeError, 'Expecting a DID URI with an "ara" method.')
  await t.throws(create({ did: idWrongMethod }), TypeError, 'Expecting a DID URI with an "ara" method.')
})

test('create() invalid id (correct method, invalid id)', async (t) => {
  const idCorrectMethod = 'did:ara:abcd'

  await t.throws(create({ owner: idCorrectMethod }), TypeError, 'ara-filesystem.create: Unable to resolve owner DID')
  await t.throws(create({ did: idCorrectMethod }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() invalid id (no method, invalid id)', async (t) => {
  const idNoMethod = 'abcd'

  await t.throws(create({ owner: idNoMethod }), TypeError, 'ara-filesystem.create: Unable to resolve owner DID')
  await t.throws(create({ did: idNoMethod }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() no id', async (t) => {
  await t.throws(create({ owner: '' }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
  await t.throws(create({ did: '' }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})

test('create() null id', async (t) => {
  await t.throws(create({ owner: null }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
  await t.throws(create({ did: null }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})
