/* eslint quotes: "off" */

const { blake2b, randomBytes } = require('ara-crypto')
const { web3: { account } } = require('ara-util')
const { web3 } = require('ara-context')()
const { getPrice } = require('../price')
const mirror = require('mirror-folder')
const { create } = require('../create')
const { cleanup } = require('./_util')
const aid = require('ara-identity')
const { add } = require('../add')
const mkdirp = require('mkdirp')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  TEST_OWNER_DID_NO_METHOD,
  TEST_OWNER_ADDRESS,
  PASSWORD: password,
  TEST_OWNER_DID,
  TEST_OWNER_PK,
  TEST_DID
} = require('./_constants')

const {
  generateStagedPath,
  readFromStaged,
  writeToStaged,
  commit
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
  const publicKey = Buffer.from(TEST_OWNER_DID_NO_METHOD, 'hex')
  const hash = blake2b(publicKey).toString('hex')
  const path = `${__dirname}/fixtures/identities`
  const ddoPath = resolve(path, hash, 'ddo.json')
  const ddo = JSON.parse(await pify(fs.readFile)(ddoPath, 'utf8'))
  const identityPath = aid.createIdentityKeyPath(ddo)
  const parsed = parse(identityPath)
  await pify(mkdirp)(parsed.dir)
  await pify(mirror)(resolve(path, hash), identityPath)
  t.context = { ddo, did: TEST_OWNER_DID_NO_METHOD }
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

test.afterEach(async (t) => await cleanup(t))

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
  await t.throwsAsync(commit({ did, password, estimate: false, price: '100' }))
  await t.throwsAsync(commit({ did, password, estimate: false, price: 0 }))
  await t.throwsAsync(commit({ did, password, estimate: false, price: -10 }))
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
  t.true('object' === typeof receipt)
})

test.serial("commit() estimate gas cost without setPrice", async (t) => {
  const { did } = getAFS(t)
  const result = await commit({ did, password, estimate: true })
  t.true(0 < Number(result))
})

test.serial("commit() estimate gas cost with setPrice", async (t) => {
  const { did } = getAFS(t)
  const result = await commit({ did, password, estimate: true, price: 100 })
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
