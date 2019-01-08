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
  AFS_PASSWORD: afsPassword
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
  await t.throwsAsync(setPrice(), TypeError)
  await t.throwsAsync(setPrice([]), TypeError)
  await t.throwsAsync(setPrice(123), TypeError)

  // did
  await t.throwsAsync(setPrice({ did: 123 }), TypeError)
  await t.throwsAsync(setPrice({ did: 'did:ara:1234' }), Error)

  // password
  await t.throwsAsync(setPrice({ did }), TypeError)
  await t.throwsAsync(setPrice({ did, password: 111 }), TypeError)
  await t.throwsAsync(setPrice({ did, password: null }), TypeError)

  // estimate
  await t.throwsAsync(setPrice({ did, password, estimate: 'true' }), TypeError)

  // price
  await t.throwsAsync(setPrice({ did, password }), TypeError)
  await t.throwsAsync(setPrice({ did, password, price: '100' }), TypeError)
  await t.throwsAsync(setPrice({ did, password, price: 0 }), TypeError)
  await t.throwsAsync(setPrice({ did, password, price: -10 }), TypeError)
})

test.serial("setPrice(opts) incorrect password", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(setPrice({ did, password: 'wrong_pass', price: 100 }))
})

test.serial("setPrice(opts) no committed proxy", async (t) => {
  const { did } = getAFS(t)
  await t.throwsAsync(setPrice({ did, password, price: 100 }), Error)
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
  await t.throwsAsync(getPrice(), TypeError)
  await t.throwsAsync(getPrice([]), TypeError)
  await t.throwsAsync(getPrice(123), TypeError)

  // did
  await t.throwsAsync(setPrice({ did: 123 }), TypeError)
  await t.throwsAsync(setPrice({ did: 'did:ara:1234' }), Error)
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

