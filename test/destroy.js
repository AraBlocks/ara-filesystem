/* eslint quotes: "off" */

const { destroy } = require('../destroy')
const { create } = require('../create')
const mirror = require('mirror-folder')
const crypto = require('ara-crypto')
const aid = require('ara-identity')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  createIdentityKeyPathFromPublicKey,
  createAFSKeyPath
} = require('../key-path')

const {
  kTestOwnerDidNoMethod,
  kPassword: password
} = require('./_constants')

const {
  resolve,
  parse
} = require('path')

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  const publicKey = Buffer.from(kTestOwnerDidNoMethod, 'hex')
  const hash = crypto.blake2b(publicKey).toString('hex')
  const path = `${__dirname}/fixtures/identities`
  const ddoPath = resolve(path, hash, 'ddo.json')
  const ddo = JSON.parse(await pify(fs.readFile)(ddoPath, 'utf8'))
  const identityPath = aid.createIdentityKeyPath(ddo)
  const parsed = parse(identityPath)
  await pify(mkdirp)(parsed.dir)
  await pify(mirror)(resolve(path, hash), identityPath)
  t.context = { ddo, did: kTestOwnerDidNoMethod }
})

test.beforeEach(async (t) => {
  const { did, ddo } = t.context
  let afs
  try {
    // eslint-disable-next-line semi
    ({ afs } = await create({ owner: did, password, ddo }));
  } catch (err) {
    console.log(err)
  }
  t.context = { afs, idPath: aid.createIdentityKeyPath(afs.ddo) }
})

test.afterEach(async (t) => {
  const { idPath } = t.context
  if (idPath) {
    await pify(rimraf)(idPath)
  }
})

test("destroy() invalid did", async (t) => {
  await t.throwsAsync(destroy(), TypeError, "Expecting non-empty string for DID")
  await t.throwsAsync(destroy({ did: 1234 }), TypeError, "Expecting non-empty string for DID")
})

test("destroy() invalid password", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(destroy({ did, password: 1234 }), TypeError, "Expecting non-empty string for password")
})

test("destroy() incorrect password", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(destroy({ did, password: 'wrongPass' }), Error, "Incorrect password")
})

test("destroy() valid params without commit", async (t) => {
  const { did } = getAFS(t)

  // make sure paths exist before destroying
  const identityPath = createIdentityKeyPathFromPublicKey(did)
  await t.notThrowsAsync(pify(fs.access)(identityPath))
  const afsPath = createAFSKeyPath(did)
  await t.notThrowsAsync(pify(fs.access)(afsPath))

  // destroy operation
  await t.notThrowsAsync(destroy({ did }))

  // ensure paths are removed
  await t.throwsAsync(pify(fs.access)(identityPath))
  await t.throwsAsync(pify(fs.access)(afsPath))
})
