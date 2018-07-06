const test = require('ava')
const { kTestDid } = require('./_constants')

const { 
  commit,
  append,
  retrieve
} = require('../commit')

/*
COMMIT with incorrect password
COMMIT but no staged files available
COMMIT successfully, verify file was deleted
COMMIT successfully, read from blockchain to ensure buffers match
*/

test("commit() invalid did", async (t) => {
  await t.throws(commit({ did: 'did:ara:1234' }), Error, "Expecting a valid DID URI")
  await t.throws(commit({ did: 1234 }), TypeError, "Expecting DID to be a string")
})

test("commit() invalid password", async (t) => {
  await t.throws(commit({ did: kTestDid, password: null }), TypeError, "Expecting password to be non-null")
  await t.throws(commit({ did: kTestDid, password: 1234 }), TypeError, "Expecting password to be a string")
})

test("commit() incorrect password", async (t) => {
  
  t.pass()
})

test("commit() no changes to commit", async (t) => {
  t.pass()
})
