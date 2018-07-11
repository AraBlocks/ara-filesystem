/* eslint quotes: "off" */

const test = require('ava')
const { resolve } = require('path')
const { create } = require('../create')
const { add } = require('../add')
const { remove } = require('../remove')
const aid = require('../aid')
const bip39 = require('bip39')

const {
  kTestDid,
  kPassword
} = require('./_constants')

// TODO(cckelly): will probably have to generate new identity every time to avoid hardcoding this
const kOwnerDid = 'e3a808f2deba17c1dcbaf176b2c529cac80c71b8418fe123439a054f88ae2cd2'

test.beforeEach(async (t) => {
  const { afs } = await create({ owner: kOwnerDid, password: kPassword })
  t.context.afs = afs
})

test.afterEach(async ({context}) => {
  const { afs } = context
  await afs.close()
})

// correct params
// remove file
// remove directory
test("remove() valid params", async (t) => {
  const { context } = t
  const file = resolve(__dirname, 'remove.js')
  //await add({ did: context.afs.did, paths: [file], password: kPassword })
  //await remove({ did: t.context.did: paths: [file], password: kPassword })
  t.pass()
})


// test("remove() invalid paths", async (t) => {
//   await t.throws(remove(), Error, "No path(s) provided")

//   await t.throws(remove({
//     did: t.context.did,
//     password: kPassword,
//     paths: [1, 2, 3]
//   }), Error, "Path found that is not of type string")

//   await t.throws(remove({
//     did: t.context.did,
//     password: kPassword,
//     paths: ['my_video.mp4']
//   }), Error, "Could not remove file either because it does not exist or because of inadequate permissions")
// })

// empty DID
// wrong prefix
// incorrect length
// doesn't exist
// test("remove() invalid did", async (t) => {
//   const paths = ['my_video.mp4']
//   let did = ''

//   await t.notThrows(remove({
//     did,
//     password: kPassword,
//     paths
//   }), Error, "Something")
// })

// empty password
// test("remove() invalid password", async (t) => {

// })

// incorrect password
// test("remove() incorrect password", async (t) => {

// })
