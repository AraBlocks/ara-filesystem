const { create } = require('../create')
const test = require('ava')
const { kTestDid } = require('./_constants')

test('create() valid id', async (t) => {
  const id = 'did:ara:e3a808f2deba17c1dcbaf176b2c529cac80c71b8418fe123439a054f88ae2cd2'

  // create AFS
  const afs = await create({ owner: id })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const resolvedAfs = await create({ did })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() valid id (no method)', async (t) => {
  const idNoMethod = 'e3a808f2deba17c1dcbaf176b2c529cac80c71b8418fe123439a054f88ae2cd2'

  // create AFS
  const afs = await create({ owner: idNoMethod })
  t.true('object' === typeof afs)

  const { did } = afs

  // resolve AFS
  const resolvedAfs = await create({ did })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
})

test('create() invalid id (wrong method)', async (t) => {
  const idWrongMethod = 'did:littlstar:e3a808f2deba17c1dcbaf176b2c529cac80c71b8418fe123439a054f88ae2cd2'

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
