const { createIdentityKeyPath } = require('ara-identity')
const { kAidPrefix } = require('../constants')
const { resolve, dirname, parse } = require('path')
const mirror = require('mirror-folder')
const { create } = require('../create')
const crypto = require('ara-crypto')
const { readFile } = require('fs')
const mkdirp = require('mkdirp')
const pify = require('pify')
const test = require('ava')

const {
  kTestOwnerDid,
  kTestOwnerDidNoMethod,
  kPassword: password
} = require('./_constants')

const getDid = (t) => {
  const { did } = t.context
  return did
}

const getDdo = (t) => {
  const { ddo } = t.context
  return ddo
}

test.before(async (t) => {
  const publicKey = Buffer.from(kTestOwnerDidNoMethod, 'hex')
  const hash = crypto.blake2b(publicKey).toString('hex')
  const path = `${__dirname}/fixtures/identities`
  const ddoPath = resolve(path, hash, 'ddo.json')
  const ddo = JSON.parse(await pify(readFile)(ddoPath, 'utf8'))
  const identityPath = createIdentityKeyPath(ddo)
  const parsed = parse(identityPath)
  await pify(mkdirp)(parsed.dir)
  await pify(mirror)(resolve(path, hash), identityPath)
  t.context = { ddo, did: kTestOwnerDidNoMethod }
})

test('create() valid id', async (t) => {
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
})

test('create() valid id (readonly)', async (t) => {
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
})

test('create() invalid id (wrong method)', async (t) => {
  const idWrongMethod = `did:littlstar:${getDid(t)}`

  await t.throwsAsync(create({
    owner: idWrongMethod,
    password,
    ddo: getDdo(t)
  }), TypeError, 'Expecting a DID URI with an "ara" method.')

  await t.throwsAsync(create({
    did: idWrongMethod,
    password,
    ddo: getDdo(t)
  }), TypeError, 'Expecting a DID URI with an "ara" method.')
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
  }), TypeError, 'ara-filesystem.create: Unable to resolve owner DID')

  await t.throwsAsync(create({
    did: idNoMethod,
    password
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
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
  await t.throwsAsync(create({ owner: kTestOwnerDid }), TypeError, 'ara-filesystem.create: Expecting non-empty password.')
})

test('create() incorrect password', async (t) => {
  const wrongPass = 'abcd'
  await t.throwsAsync(create({
    owner: kTestOwnerDid,
    password: wrongPass
  }), Error, 'ara-filesystem.create: incorrect password.')

  await t.throwsAsync(create({
    did: kTestOwnerDid,
    password: wrongPass
  }), Error, 'ara-filesystem.create: incorrect password.')
})
