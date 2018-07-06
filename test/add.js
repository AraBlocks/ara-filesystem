/* eslint quotes: "off" */

const test = require('ava')
const { resolve } = require('path')
const { add } = require('../add')
const aid = require('../aid')

const {
  kPassword: password,
  kTestDid
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

  const file = resolve(__dirname, 'my_video.mp4')
  await t.notThrows(add({
    did: kTestDid,
    password,
    paths: [file]
  }), Error, "Path must exist")
})

// password empty
// password not string
// test("add() invalid password", async (t) => {

// })

// incorrect password
// test("add() incorrect password", async (t) => {

// })

// invalid watch (not bool)
// test("add() invalid watch", async (t) => {

// })

// invalid force (not bool)
// test("add() invalid bool", async (t) => {

// })

// add file
// add directory
// add multiple files
// add multiple directories
// add multiple files + directories
// test("add() valid params", async (t) => {
  
// })


