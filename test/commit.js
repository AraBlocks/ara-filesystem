/* eslint quotes: "off" */

const { blake2b } = require('ara-crypto')
const mirror = require('mirror-folder')
const { create } = require('../create')
const aid = require('ara-identity')
const { add } = require('../add')
const mkdirp = require('mkdirp')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  kPassword: password,
  kTestDid,
  kTestOwnerDidNoMethod
} = require('./_constants')

const {
  commit,
  append,
  retrieve,
  generateStagedPath,
  estimateCommitGasCost
} = require('../commit')

const {
  resolve,
  parse
} = require('path')

const runValidCommit = async (t) => {
  const { did } = getAFS(t)
  await commit({ did, password })
  return did
}

const isHex = (input) => {
  const regexp = /[0-9A-Fa-f]/
  return regexp.test(input)
}

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  const publicKey = Buffer.from(kTestOwnerDidNoMethod, 'hex')
  const hash = blake2b(publicKey).toString('hex')
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
  t.context = { afs }
})

test("generateStagedPath() valid did", (t) => {
  const { did } = getAFS(t)
  const path = generateStagedPath(did)
  t.notThrows(() => fs.accessSync(path))
})

test("commit() invalid did", async (t) => {
  await t.throwsAsync(commit({ did: 'did:ara:1234' }), Error, "Expecting a valid DID URI")
  await t.throwsAsync(commit({ did: 1234 }), TypeError, "Expecting DID to be a string")
})

test("commit() invalid password", async (t) => {
  await t.throwsAsync(commit({ did: kTestDid, password: null }), TypeError, "Expecting password to be non-null")
  await t.throwsAsync(commit({ did: kTestDid, password: 1234 }), TypeError, "Expecting password to be a string")
})

test("commit() incorrect password", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(commit({ did, password: 'wrong_password' }), Error, "Incorrect password")
})

test("commit() no changes to commit", async (t) => {
  const did = await runValidCommit(t)
  await t.throwsAsync(commit({ did, password }), Error, "No staged commits ready to be pushed")
})

test("commit() staged file successfully deleted", async (t) => {
  const { did } = getAFS(t)
  const file = resolve(__dirname, 'commit.js')
  await add({ did, paths: [ file ], password })

  const path = generateStagedPath(did)
  await runValidCommit(t)
  t.throws(() => fs.accessSync(path))
})

// TODO: make test without blockchain dependency
test.skip("commit() previously cached buffers match blockchain buffers", async (t) => {
  const file = resolve(__dirname, '../index.js')

  const { publicKey } = t.context
  const { afs } = await create({ owner: publicKey, password })
  const { did } = afs
  await add({ did, paths: [ file ], password })
  const path = generateStagedPath(did)

  let contents = fs.readFileSync(path, 'utf8')
  contents = JSON.parse(decryptJSON(contents, password))

  const mTree = contents['metadata/tree']
  const mSig = contents['metadata/signatures']

  await commit({ did, password })

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const hIdentity = blake2b(Buffer.from(did)).toString('hex')

  let buffer = await deployed.methods.read(hIdentity, 0, 0).call()
  t.is(mTree['0'], buffer.slice(2))

  buffer = await deployed.methods.read(hIdentity, 0, 32).call()
  t.is(mTree['32'], buffer.slice(2))

  buffer = await deployed.methods.read(hIdentity, 0, 72).call()
  t.is(mTree['72'], buffer.slice(2))

  buffer = await deployed.methods.read(hIdentity, 1, 0).call()
  t.is(mSig['0'], buffer.slice(2))

  buffer = await deployed.methods.read(hIdentity, 1, 32).call()
  t.is(mSig['32'], buffer.slice(2))

  buffer = await deployed.methods.read(hIdentity, 1, 96).call()
  t.is(mSig['96'], buffer.slice(2))

  buffer = await deployed.methods.read(hIdentity, 1, 160).call()
  t.is(mSig['160'], buffer.slice(2))
})

test("retrieve() offset doesn't exist", (t) => {
  const { did } = getAFS(t)
  const result = retrieve({
    did,
    fileIndex: 0,
    offset: 10000000,
    password
  })
  t.is(result, undefined)
})

test("retrieve() valid params", (t) => {
  const { did } = getAFS(t)

  // validate metadata/tree
  const mtHeader = retrieve({ did, fileIndex: 0, password })
  t.true(isHex(mtHeader) && 64 === mtHeader.length)

  // validate metadata/signatures
  const msHeader = retrieve({ did, fileIndex: 1, password })
  t.true(isHex(msHeader) && 64 === msHeader.length)
})

test("append() valid params", (t) => {
  const { did } = getAFS(t)
  const data = Buffer.from('0x0101')
  append({
    did,
    fileIndex: 0,
    offset: 96,
    data,
    password
  })

  const result = retrieve({
    did,
    fileIndex: 0,
    offset: 96,
    password
  })
  t.is(data.toString('hex'), result.toString('hex'))
})

test("estimateCommitGasCost() invalid did", async (t) => {
  await t.throws(estimateCommitGasCost(), TypeError, "Expecting non-empty string for DID URI")
  await t.throws(estimateCommitGasCost({ did: 123 }), TypeError, "Expecting non-empty string for DID URI")
})

test("estimateCommitGasCost() invalid password", async (t) => {
  const { did } = getAFS(t)
  await t.throws(estimateCommitGasCost({ did }), TypeError, "Expecting non-empty string for password")
  await t.throws(estimateCommitGasCost({ did, password: 123 }), TypeError, "Expecting non-empty string for password")
})

test("estimateCommitGasCost() incorrect password", async (t) => {
  const { did } = getAFS(t)
  await t.throws(estimateCommitGasCost({ did, password: 'wrongPassword' }), Error, "Incorrect password")
})

test("estimateCommitGasCost() valid params", async (t) => {
  const { did } = getAFS(t)
  const cost = await estimateCommitGasCost({ did, password })
  t.true('number' === typeof cost && 0 <= cost)
})
