/* eslint quotes: "off" */

const { PASSWORD: password } = require('./_constants')
const { randomBytes } = require('ara-crypto')
const { getPrice } = require('../price')
const { resolve } = require('path')
const { add } = require('../add')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  mirrorIdentity,
  createAFS,
  cleanup
} = require('./_util')

const {
  generateStagedPath,
  readFromStaged,
  writeToStaged,
  commit
} = require('../commit')

const runValidCommit = async (t) => {
  const { did } = getAFS(t)
  await commit({ did, password })
  return did
}

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
})

test.beforeEach(async (t) => {
  t.context = await createAFS(t)
})

test.afterEach(async t => cleanup(t))

test("generateStagedPath() valid did", (t) => {
  const { did } = getAFS(t)
  const path = generateStagedPath(did)
  t.notThrows(() => fs.accessSync(path))
})

test('commit() invalid opts', async (t) => {
  const { did } = t.context

  // opts
  await t.throwsAsync(commit(), TypeError)
  await t.throwsAsync(commit('opts'), TypeError)
  await t.throwsAsync(commit({ }), TypeError)

  // did
  await t.throwsAsync(commit({ did: 'did:ara:1234' }), TypeError)
  await t.throwsAsync(commit({ did: 0x123 }), TypeError)
  await t.throwsAsync(commit({ did: 123 }), TypeError)
  await t.throwsAsync(commit({ did: null }), TypeError)

  // password
  await t.throwsAsync(commit({ did }), TypeError)
  await t.throwsAsync(commit({ did, password: '' }))
  await t.throwsAsync(commit({ did, password: 123 }))

  // estimate
  await t.throwsAsync(commit({ did, password, estimate: 'false' }))

  // price
  await t.throwsAsync(commit({
    did,
    password,
    estimate: false,
    price: '100'
  }))
  await t.throwsAsync(commit({
    did,
    password,
    estimate: false,
    price: 0
  }))
  await t.throwsAsync(commit({
    did,
    password,
    estimate: false,
    price: -10
  }))
})

test('commit() incorrect password', async (t) => {
  const { did } = t.context
  await t.throwsAsync(commit({ did, password: 'wrong_pass' }), Error)
})

test.serial("commit() no changes to commit", async (t) => {
  const did = await runValidCommit(t)
  await t.throwsAsync(commit({ did, password }), Error)
})

test.serial("commit() staged file successfully deleted", async (t) => {
  const { did } = getAFS(t)
  const file = resolve(__dirname, 'commit.js')
  await add({ did, paths: [ file ], password })

  const path = generateStagedPath(did)
  await runValidCommit(t)
  t.throws(() => fs.accessSync(path))
})

test.serial("commit() commit with price", async (t) => {
  const { did } = getAFS(t)
  const price = 100
  const receipt = await commit({ did, password, price })
  const queriedPrice = await getPrice({ did })
  t.is(price, Number(queriedPrice))
  t.true(receipt.status)
})

test.serial("commit() estimate gas cost without setPrice", async (t) => {
  const { did } = getAFS(t)
  const result = await commit({ did, password, estimate: true })
  t.true(0 < Number(result))
})

test.serial("commit() estimate gas cost with setPrice", async (t) => {
  const { did } = getAFS(t)
  const result = await commit({
    did,
    password,
    estimate: true,
    price: 100
  })
  t.true(0 < Number(result))
})

test("writeToStaged()/readFromStaged()", async (t) => {
  const data = randomBytes(32).toString('hex')
  const path = resolve(__dirname, 'staged.json')
  console.log('path', path)
  const { did } = getAFS(t)

  // ensure does not exist
  await t.throwsAsync(pify(fs.access)(path), Error)

  writeToStaged({
    did,
    password,
    data,
    fileIndex: 0,
    offset: 0
  })

  const buffer = readFromStaged({
    did,
    password,
    fileIndex: 0
  })

  t.is(data, buffer)
})
