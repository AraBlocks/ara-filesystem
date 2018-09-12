/* eslint quotes: "off" */

const { PASSWORD: password } = require('./_constants')
const { destroy } = require('../destroy')
const { create } = require('../create')
const aid = require('ara-identity')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  createIdentityKeyPathFromPublicKey,
  createAFSKeyPath
} = require('../key-path')

const {
  mirrorIdentity,
  cleanup
} = require('./_util')

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
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
  t.context = { afs, idPath: aid.createIdentityKeyPath(afs.ddo), afsPath: createAFSKeyPath(afs.did) }
})

test.afterEach(async (t) => {
  await cleanup(t)
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
