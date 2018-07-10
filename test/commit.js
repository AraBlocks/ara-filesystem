/* eslint quotes: "off" */

const debug = require('debug')('test')
const test = require('ava')
const fs = require('fs')
const { resolve } = require('path')
const { create } = require('../create')
const { add } = require('../add')
const { decryptJSON } = require('../util')
const { blake2b } = require('ara-crypto')
const { web3 } = require('ara-context')()
const { abi } = require('../build/contracts/Storage.json')
const { kStorageAddress } = require('../constants')

const {
  kPassword: password,
  kTestDid,
  kTestOwnerDid
} = require('./_constants')

const { 
  commit,
  append,
  retrieve,
  generateStagedPath
} = require('../commit')

const getDid = (t) => {
  const { context } = t
  const { did } = context
  return did
}

const runValidCommit = async (t) => {
  const did = getDid(t)
  await commit({ did, password })
  return did
}

const isHex = (input) => {
  const regexp = /[0-9A-Fa-f]/
  return regexp.test(input)
}

test.before(async (t) => {
  const { afs } = await create({ owner: kTestOwnerDid, password })
  const { did } = afs
  t.context = { did }
})

test("generateStagedPath() valid did", (t) => {
  const did = getDid(t)
  const path = generateStagedPath(did)
  t.notThrows(() => fs.accessSync(path))
})

test("commit() invalid did", async (t) => {
  await t.throws(commit({ did: 'did:ara:1234' }), Error, "Expecting a valid DID URI")
  await t.throws(commit({ did: 1234 }), TypeError, "Expecting DID to be a string")
})

test("commit() invalid password", async (t) => {
  await t.throws(commit({ did: kTestDid, password: null }), TypeError, "Expecting password to be non-null")
  await t.throws(commit({ did: kTestDid, password: 1234 }), TypeError, "Expecting password to be a string")
})

test("commit() incorrect password", async (t) => {
  const did = getDid(t)
  await t.throws(commit({ did, password: 'wrong_password'}), Error, "Incorrect password")
})

test("commit() no changes to commit", async (t) => {
  const did = await runValidCommit(t)
  await t.throws(commit({ did, password }), Error, "No staged commits ready to be pushed")
})

test("commit() staged file successfully deleted", async (t) => {
  const did = getDid(t)
  const file = resolve(__dirname, 'commit.js')
  await add({ did, paths: [file], password })

  const path = generateStagedPath(did)
  await runValidCommit(t)
  t.throws(() => fs.accessSync(path))
})

test("commit() previously cached buffers match blockchain buffers", async (t) => {
  const file = resolve(__dirname, '../index.js')
  const { afs } = await create({ owner: kTestOwnerDid, password })
  const { did } = afs
  await add({ did, paths: [file], password })
  const path = generateStagedPath(did)
  
  let contents = fs.readFileSync(path, 'utf8')
  contents = JSON.parse(decryptJSON(contents, password))
  
  const mTree = contents['metadata/tree']
  const cSig = contents['content/signatures']

  await commit({ did, password })

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const hIdentity = blake2b(Buffer.from(did)).toString('hex')

  let buffer = await deployed.methods.read(hIdentity, 2, 0).call()
  t.is(mTree['0'], buffer.slice(2))

  buffer = await deployed.methods.read(hIdentity, 1, 32).call()
  t.is(cSig['32'], buffer.slice(2))
})

test("retrieve() offset doesn't exist", (t) => {
  const did = getDid(t)
  const result = retrieve({ did, fileIndex: 0, offset: 10000000, password })
  t.is(result, undefined)
})

test("retrieve() valid params", (t) => {
  const did = getDid(t)

  // validate content/tree
  const ctHeader = retrieve({ did, fileIndex: 0, password })
  t.true(isHex(ctHeader) && 64 === ctHeader.length)

  // validate content/signatures
  const csHeader = retrieve({ did, fileIndex: 1, password })
  t.true(isHex(csHeader) && 64 === csHeader.length)

  // validate metadata/tree
  const mtHeader = retrieve({ did, fileIndex: 2, password })
  t.true(isHex(mtHeader) && 64 === mtHeader.length)
  
  // validate metadata/signatures
  const msHeader = retrieve({ did, fileIndex: 3, password })
  t.true(isHex(msHeader) && 64 === msHeader.length)
})

test("append() valid params", (t) => {
  const did = getDid(t)
  const data = Buffer.from('0x0101')
  append({ did, fileIndex: 0, offset: 96, data, password })
  const result = retrieve({ did, fileIndex: 0, offset: 96, password })
  t.is(data.toString('hex'), result.toString('hex'))
})
