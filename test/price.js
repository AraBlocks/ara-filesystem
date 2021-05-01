/* eslint quotes: "off" */

const { deploy } = require('../deploy')
const { commit } = require('../commit')
const test = require('ava')

const {
  mirrorIdentity,
  createAFS,
  cleanup
} = require('./_util')

const {
  setPrice,
  getPrice,
} = require('../price')

const {
  PASSWORD: password,
  AFS_PASSWORD: afsPassword,
  STANDARD_ESTIMATE_PROXY_DID: estimateDid
} = require('./_constants')

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

test.serial("setPrice(opts) invalid opts", async (t) => {
  const { did } = getAFS(t)

  // opts
  await t.throwsAsync(setPrice(), { instanceOf: TypeError })
  await t.throwsAsync(setPrice([]), { instanceOf: TypeError })
  await t.throwsAsync(setPrice(123), { instanceOf: TypeError })

  // did
  await t.throwsAsync(setPrice({ did: 123 }), { instanceOf: TypeError })
  await t.throwsAsync(setPrice({ did: 'did:ara:1234' }), { instanceOf: Error })

  // password
  await t.throwsAsync(setPrice({ did }), { instanceOf: TypeError })
  await t.throwsAsync(setPrice({ did, password: 111 }), { instanceOf: TypeError })
  await t.throwsAsync(setPrice({ did, password: null }), { instanceOf: TypeError })

  // estimate
  await t.throwsAsync(setPrice({ did, password, estimate: 'true' }), { instanceOf: TypeError })

  // price
  await t.throwsAsync(setPrice({ did, password }), { instanceOf: TypeError })
  await t.throwsAsync(setPrice({ did, password, price: '100' }), { instanceOf: TypeError })
  await t.throwsAsync(setPrice({ did, password, price: -10 }), { instanceOf: TypeError })
})

test.serial("setPrice(opts) incorrect password", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(setPrice({ did, password: 'wrong_pass', price: 100 }), { instanceOf: Error })
})

test.serial("setPrice(opts) no committed proxy", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(setPrice({ did, password, price: 100 }), { instanceOf: Error })
})

test.serial("setPrice(opts) estimate, no proxy", async (t) => {
  const { did } = getAFS(t)
  const estimation = await setPrice({
    did,
    password,
    afsPassword,
    estimate: true,
    price: 100,
    // deployed in commit.js test
    estimateDid
  })
  t.true(0 < Number(estimation))
})

test.serial("setPrice(opts) estimate is false, no proxy", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(setPrice({
    did,
    password,
    afsPassword,
    estimate: false,
    price: 100,
    // deployed in commit.js test
    estimateDid
  }), { instanceOf: Error })
})

test.serial("setPrice(opts) estimate", async (t) => {
  const { did } = getAFS(t)
  await deploy({ did, password, afsPassword })
  await commit({ did, password, afsPassword })
  const estimation = await setPrice({
    did,
    password,
    afsPassword,
    estimate: true,
    price: 100
  })
  t.true(0 < Number(estimation))
})

test.serial("getPrice(opts) invalid opts", async (t) => {
  // opts
  await t.throwsAsync(getPrice(), { instanceOf: TypeError })
  await t.throwsAsync(getPrice([]), { instanceOf: TypeError })
  await t.throwsAsync(getPrice(123), { instanceOf: TypeError })

  // did
  await t.throwsAsync(setPrice({ did: 123 }), { instanceOf: TypeError })
  await t.throwsAsync(setPrice({ did: 'did:ara:1234' }), { instanceOf: Error })
})

test.serial("setPrice()/getPrice()", async (t) => {
  const { did } = getAFS(t)
  await deploy({ did, password, afsPassword })
  await commit({ did, password, afsPassword })

  const price = 25
  await setPrice({
    did, password, price, afsPassword
  })

  const retrievedPrice = await getPrice({ did })
  t.is(price, Number(retrievedPrice))
})

