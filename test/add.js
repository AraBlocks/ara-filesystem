/* eslint quotes: "off" */

const test = require('ava')
const { resolve } = require('path')
const { add } = require('../add')
const { create } = require('../create')
const aid = require('../aid')
const { loadSecrets } = require('../util')

const {
  kArchiverKey,
  kResolverKey
} = require('../constants')

const {
  kPassword: password,
  kTestDid,
  kTestOwnerDid,
  kTestOwnerDidNoMethod
} = require('./_constants')

test("add() invalid did", async (t) => {
  await t.throws(add({did: ''}), TypeError, "Expecting non-empty DID")
  await t.throws(add({did: null}), TypeError, "Expecting non-null DID")

  let did = `did:littlstar:${kTestDid}`
  await t.throws(add({
    did,
    password,
    paths: resolve(__dirname, '_constants.js')
  }), TypeError, "Expecting DID with ara method")

  did = did.slice(did.length - 32)
  await t.throws(add({
    did,
    password,
    paths: resolve(__dirname, '_constants.js')
  }), Error, "Unable to resolve DID")
})

// path that isn't a string
test("add() invalid paths", async (t) => {
  await t.throws(add({
    did: kTestDid,
    password,
    paths: null
  }), TypeError, "Expecting one or more paths to add")

  const { afs } = await create({ owner: kTestOwnerDid, password })
  const { did } = afs

  const file = resolve(__dirname, 'my_video.mp4')
  await t.throws(add({
    did,
    password,
    paths: [file]
  }), Error, "Path must exist")

  t.context.did = did
})

test("add() invalid password", async (t) => {
  await t.throws(add({
    did: kTestDid,
    password: '',
    paths: ['add.js']
  }), TypeError, "Password must be non-empty string")

  await t.throws(add({
    did: kTestDid,
    password: 111,
    paths: ['add.js']
  }), TypeError, "Password must be non-empty string")
})

test("add() incorrect password", async (t) => {
  const { afs } = await create({ owner: kTestOwnerDid, password })
  await t.throws(add({
    did: afs.did,
    password: 'wrongpass',
    paths: ['add.js']
  }), Error, "Incorrect password")
})

// add file
// add directory
// add multiple files
// add multiple directories
// add multiple files + directories
test("add() valid params", async (t) => {
  //const { afs } = await create({ owner: kTestOwnerDid, password })
  // const file = resolve(__dirname, 'add.js')
  // await t.notThrows(add({did: afs.did, password, paths: [file] }))
  // await t.notThrows(add({
  //   did: afs.did,
  //   password,
  //   paths: [resolve(__dirname, 'add.js')]
  // }))
  t.pass()
})


