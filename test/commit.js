/* eslint quotes: "off" */

const { randomBytes } = require('ara-crypto')
const { getPrice } = require('../price')
const { deploy } = require('../deploy')
const { resolve } = require('path')
const { add } = require('../add')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  STANDARD_ESTIMATE_PROXY_DID: estimateDid,
  ESTIMATE_PASSWORD: estimatePassword,
  AFS_PASSWORD: afsPassword,
  PASSWORD: password
} = require('./_constants')

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

const runValidCommit = async (opts) => {
  // never estimate deploy in these instances
  await deploy({ ...Object.assign({}, opts, { estimate: false }) })
  const result = await commit({ ...opts })
  return { result }
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

test.serial("generateStagedPath() valid did", (t) => {
  const { did } = getAFS(t)
  const path = generateStagedPath(did)
  t.notThrows(() => fs.accessSync(path))
})

test.serial('commit() invalid opts', async (t) => {
  const { did } = t.context

  // opts
  await t.throwsAsync(commit(), { instanceOf: TypeError })
  await t.throwsAsync(commit('opts'), { instanceOf: TypeError })
  await t.throwsAsync(commit({ }), { instanceOf: TypeError })

  // did
  await t.throwsAsync(commit({ did: 'did:ara:1234' }), { instanceOf: Error })
  await t.throwsAsync(commit({ did: 0x123 }), { instanceOf: TypeError })
  await t.throwsAsync(commit({ did: 123 }), { instanceOf: TypeError })
  await t.throwsAsync(commit({ did: null }), { instanceOf: TypeError })

  // password
  await t.throwsAsync(commit({ did }), { instanceOf: TypeError })
  await t.throwsAsync(commit({ did, password: '' }), { instanceOf: Error })
  await t.throwsAsync(commit({ did, password: 123 }), { instanceOf: Error })

  // estimate
  await t.throwsAsync(commit({ did, password, estimate: 'false' }), { instanceOf: Error })

  // price
  await t.throwsAsync(commit({
    did,
    password,
    estimate: false,
    price: '100'
  }), { instanceOf: Error })
  await t.throwsAsync(commit({
    did,
    password,
    estimate: false,
    price: 0
  }), { instanceOf: Error })
  await t.throwsAsync(commit({
    did,
    password,
    estimate: false,
    price: -10
  }), { instanceOf: Error })
})

test.serial('commit() incorrect password', async (t) => {
  const { did } = t.context
  await t.throwsAsync(commit({ did, password: 'wrong_pass' }), { instanceOf: Error })
})

test.serial('commit() estimate no deploy', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(commit({
    afsPassword,
    estimate: true,
    password,
    did,
  }), { instanceOf: Error })
})

test.serial('commit() estimate with proxy, no deploy', async (t) => {
  // deploy estimate proxy
  await deploy({
    afsPassword: estimatePassword,
    version: '6_estimate',
    did: estimateDid,
    password
  })
  const { did } = getAFS(t)
  const result = await commit({
    afsPassword,
    estimateDid,
    estimate: true,
    password,
    did,
  })
  t.true(0 < Number(result))
})

test.serial('commit() with proxy, estimate is false', async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(commit({
    afsPassword,
    estimateDid,
    estimate: false,
    password,
    did,
  }), { instanceOf: Error })
})

test.serial("commit() no changes to commit", async (t) => {
  const { did } = getAFS(t)
  await runValidCommit({ did, password, afsPassword })
  await t.throwsAsync(commit({ did, password }), { instanceOf: Error })
})

test.serial("commit() staged file successfully deleted", async (t) => {
  const { did } = getAFS(t)
  const file = resolve(__dirname, 'commit.js')
  await add({ did, paths: [ file ], password: afsPassword })

  const path = generateStagedPath(did)
  await runValidCommit({ did, password, afsPassword })
  t.throws(() => fs.accessSync(path))
})

test.serial("commit() commit with price", async (t) => {
  const { did } = getAFS(t)
  const price = 100
  const { result: receipt } = await runValidCommit({
    afsPassword,
    password,
    price,
    did
  })
  const queriedPrice = await getPrice({ did })
  t.is(price, Number(queriedPrice))
  t.true('object' === typeof receipt)
})

test.serial("commit() estimate gas cost without setPrice", async (t) => {
  const { did } = getAFS(t)
  const { result } = await runValidCommit({
    afsPassword,
    estimate: true,
    password,
    did
  })
  t.true(0 < Number(result))
})

test.serial("commit() estimate gas cost with setPrice", async (t) => {
  const { did } = getAFS(t)
  const { result } = await runValidCommit({
    afsPassword,
    estimate: true,
    price: 100,
    password,
    did
  })
  t.true(0 < Number(result))
})

test.serial("writeToStaged()/readFromStaged()", async (t) => {
  const data = randomBytes(32).toString('hex')
  const path = resolve(__dirname, 'staged.json')
  const { did } = getAFS(t)

  // ensure does not exist
  await t.throwsAsync(pify(fs.access)(path), { instanceOf: Error })

  writeToStaged({
    did,
    data,
    fileIndex: 0,
    offset: 0
  })

  const buffer = readFromStaged({
    did,
    fileIndex: 0
  })

  t.is(data, buffer)
})
