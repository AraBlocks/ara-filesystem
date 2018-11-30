const { createIdentityKeyPath } = require('ara-identity')
const { createAFSKeyPath } = require('../key-path')
const { create } = require('../create')
const test = require('ava')

const {
  TEST_OWNER_DID,
  PASSWORD: password
} = require('./_constants')

const {
  mirrorIdentity,
  cleanup
} = require('./_util')

const getDid = (t) => {
  const { did } = t.context
  return did
}

const getDdo = (t) => {
  const { ddo } = t.context
  return ddo
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
})

test.afterEach(async (t) => {
  await cleanup(t)
})

test.serial('create() valid id', async (t) => {
  const owner = getDid(t)
  const ddo = getDdo(t)
  // create AFS
  const { afs } = await create({ owner, password, ddo })
  t.true('object' === typeof afs)
  const { did } = afs

  // resolve AFS
  const { afs: resolvedAfs } = await create({ did, password, ddo: afs.ddo })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
  t.context.idPath = createIdentityKeyPath(afs.ddo)
  t.context.afsPath = createAFSKeyPath(did)
})

test.serial('create() valid id (readonly)', async (t) => {
  const owner = getDid(t)
  const ddo = getDdo(t)
  // create AFS
  const { afs } = await create({ owner, password, ddo })
  t.true('object' === typeof afs)
  const { did } = afs

  // resolve AFS readonly
  const { afs: resolvedAfs } = await create({ did, ddo: afs.ddo })
  t.true('object' === typeof resolvedAfs)

  t.true(afs === resolvedAfs)
  t.context.idPath = createIdentityKeyPath(afs.ddo)
  t.context.afsPath = createAFSKeyPath(did)
})

test('create() invalid id (wrong method)', async (t) => {
  const idWrongMethod = `did:littlstar:${getDid(t)}`

  await t.throwsAsync(create({
    owner: idWrongMethod,
    password,
    ddo: getDdo(t)
  }), Error, 'Expecting a DID URI with an "ara" method.')

  await t.throwsAsync(create({
    did: idWrongMethod,
    password,
    ddo: getDdo(t)
  }), Error, 'Expecting a DID URI with an "ara" method.')
})

test('create() invalid id (correct method, invalid id)', async (t) => {
  const idCorrectMethod = 'did:ara:abcd'

  await t.throwsAsync(create({
    owner: idCorrectMethod,
    password
  }), Error, 'ara-filesystem.create: Unable to resolve owner DID')

  await t.throwsAsync(create({
    did: idCorrectMethod,
    password
  }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() invalid id (no method, invalid id)', async (t) => {
  const idNoMethod = 'abcd'

  await t.throwsAsync(create({
    owner: idNoMethod,
    password
  }), Error, 'ara-filesystem.create: Unable to resolve owner DID')

  await t.throwsAsync(create({
    did: idNoMethod,
    password
  }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('create() no id', async (t) => {
  await t.throwsAsync(create({
    owner: '',
    password
  }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')

  await t.throwsAsync(create({
    did: '',
    password
  }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})

test('create() null id', async (t) => {
  await t.throwsAsync(create({
    owner: null,
    password
  }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')

  await t.throwsAsync(create({
    did: null,
    password
  }), TypeError, 'ara-filesystem.create: Expecting non-empty string.')
})

test('create() no password', async (t) => {
  await t.throwsAsync(create({ owner: TEST_OWNER_DID }), TypeError, 'ara-filesystem.create: Expecting non-empty password.')
})

test('create() incorrect password', async (t) => {
  const wrongPass = 'abcd'
  await t.throwsAsync(create({
    owner: TEST_OWNER_DID,
    password: wrongPass
  }), Error, 'ara-filesystem.create: incorrect password.')

  await t.throwsAsync(create({
    did: TEST_OWNER_DID,
    password: wrongPass
  }), Error, 'ara-filesystem.create: incorrect password.')
})
