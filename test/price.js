/* eslint quotes: "off" */

const test = require('ava')
const { create } = require('../create')
const { commit } = require('../commit')
const { setPrice, getPrice } = require('../price')

const {
  kTestOwnerDid,
  kPassword: password
} = require('./_constants')

// test setting price when AFS hasn't been comitted yet
// test setting price after AFS has been committed

// test getting price when AFS doesn't exist
// test getting prcie when AFS does exist

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
  await t.throws(setPrice({ did, password, price: '10' }), TypeError, 
    "Price should be 0 or positive whole number")
})

test("setPrice() incorrect password", async (t) => {
  const did = getDid(t)
  await t.throws(setPrice({ did, password: 'wrongPassword', price: 10 }), Error, "Incorrect password")
})

test("setPrice() not committed yet", async (t) => {
  const did = getDid(t)
  await t.throws(setPrice({ did, password, price: 111 }), Error, 
    `AFS has not been committed yet so the transaction has been reverted. Please commit
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
  console.log('2')
  const did = getDid(t)
  await commit({ did, password })

  const price = 25
  await setPrice({ did, password, price })

  const retrievedPrice = await getPrice({ did, password })
  t.is(price, Number(retrievedPrice))
})

