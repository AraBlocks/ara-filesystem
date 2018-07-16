/* eslint quotes: "off" */

const test = require('ava')
const { create } = require('../create')
const { commit } = require('../commit')

const {
  setPrice,
  getPrice,
  estimateSetPriceGasCost
} = require('../price')

const {
  kTestOwnerDid,
  kPassword: password
} = require('./_constants')

const getDid = ({ context }) => {
  const { did } = context
  return did
}

test.before(async (t) => {
  const { afs } = await create({ owner: kTestOwnerDid, password })
  const { did } = afs
  t.context = { did }
})

test("setPrice() invalid DID", async (t) => {
  await t.throws(setPrice(), TypeError, "Expecting non-empty string as DID")
  await t.throws(setPrice({ did: 111 }), TypeError, "Expecting non-empty string as DID")
})

test("setPrice() invalid password", async (t) => {
  const did = getDid(t)
  await t.throws(setPrice({ did, password: 111 }), TypeError, "Expecting non-empty string for password")
  await t.throws(setPrice({ did }), TypeError, "Expecting non-empty string for password")
})

test("setPrice() invalid price", async (t) => {
  const did = getDid(t)
  await t.throws(setPrice({
    did,
    password,
    price: '10'
  }), TypeError, "Price should be 0 or positive whole number")

  await t.throws(setPrice({
    did,
    password,
    price: -1
  }), TypeError, "Price should be 0 or positive whole number")
})

test("setPrice() incorrect password", async (t) => {
  const did = getDid(t)
  await t.throws(setPrice({ did, password: 'wrongPassword', price: 10 }), Error, "Incorrect password")
})

test("setPrice() not committed yet", async (t) => {
  const did = getDid(t)
  await t.throws(setPrice({
    did,
    password,
    price: 111
  }), Error, `AFS has not been committed yet so the 
    transaction has been reverted. Please commit
    the AFS prior to setting price.`)
})

test("getPrice() invalid DID", async (t) => {
  await t.throws(getPrice(), TypeError, "Expecting non-empty string as DID")
  await t.throws(getPrice({ did: 111 }), TypeError, "Expecting non-empty string as DID")
})

test("getPrice() invalid password", async (t) => {
  const did = getDid(t)
  await t.throws(getPrice({ did, password: 111 }), TypeError, "Expecting non-empty string for password")
  await t.throws(getPrice({ did }), TypeError, "Expecting non-empty string for password")
})

test("getPrice() incorrect password", async (t) => {
  const did = getDid(t)
  await t.throws(getPrice({ did, password: 'wrongPassword', price: 10 }), Error, "Incorrect password")
})

test.serial("getPrice() not committed yet", async (t) => {
  const did = getDid(t)
  const price = await getPrice({ did, password })
  t.is(Number(price), 0)
})

test("setPrice() getPrice() valid params", async (t) => {
  const did = getDid(t)
  await commit({ did, password })

  const price = 25
  await setPrice({ did, password, price })

  const retrievedPrice = await getPrice({ did, password })
  t.is(price, Number(retrievedPrice))
})

test("estimateSetPriceGasCost() invalid did", async (t) => {
  await t.throws(estimateSetPriceGasCost(), TypeError, "Expecting non-empty string for DID URI")
  await t.throws(estimateSetPriceGasCost({ did: 123 }), TypeError, "Expecting non-empty string for DID URI")
})

test("estimateSetPriceGasCost() invalid password", async (t) => {
  const did = getDid(t)
  await t.throws(estimateSetPriceGasCost({ did }), TypeError, "Expecting non-empty string for password")
  await t.throws(estimateSetPriceGasCost({ did, password: 123 }), TypeError, "Expecting non-empty string for password")
})

test("estimateSetPriceGasCost() invalid price", async (t) => {
  const did = getDid(t)
  await t.throws(estimateSetPriceGasCost({ did, password, price: -1 }), TypeError, "Price should be positive whole number")
  await t.throws(estimateSetPriceGasCost({ did, password, price: '1' }), TypeError, "Price should be positive whole number")
})

test("estimateSetPriceGasCost() incorrect password", async (t) => {
  const did = getDid(t)
  await t.throws(estimateSetPriceGasCost({ did, password: 'wrongPassword', price: 10 }), Error, "Incorrect password")
})

test("estimateSetPriceGasCost() not committed", async (t) => {
  const did = getDid(t)
  await t.throws(estimateSetPriceGasCost({ did, password, price: 60 }), Error, "AFS has not been committed yet")
})

test("estimateSetPriceGasCost() valid params", async (t) => {
  const did = getDid(t)
  await commit({ did, password })
  const cost = await estimateSetPriceGasCost({ did, password, price: 60 })
  t.true('number' === typeof cost && 0 <= cost)
})

