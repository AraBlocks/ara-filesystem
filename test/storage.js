/* eslint quotes: off */

const test = require('ava')
const { blake2b } = require('ara-crypto')
const { kTestDid } = require('./_constants')
const { write, read } = require('../storage')

const opts = {
  identity: kTestDid,
  root: 'root',
  signature: 'signature'
}

// path is empty
// path doesn't contain '/'
// path is not string
test("resolveBufferIndex() invalid path", (t) => {

})

// make sure key/value pairs match
test("resolveBufferIndex() valid params", (t) => {

})

// pass in path with home and metadata/tree and make sure create returns RAS instance
// pass in path without home and metadata/tree and make sure result is RAF instance
test("defaultStorage() validate return values", (t) => {

})

// write and make sure that staged commit is added to staged.json and everything matches
test("defaultStorage().write()", (t) => {

})

// test buffer returned from commit.retrieve is correct
// make sure buffer returned from contract matches what was written
test("defaultStorage().read()", (t) => {

})

test("defaultStorage().stat()", (t) => {

})

test("defaultStorage().del()", (t) => {

})

// TODO(cckelly): old

test(`publish({
  identity = '',
  root = '',
  signature = ''
}= {})`, async (t) => {
  await t.throws(publish({ identity: null }), TypeError, "identity cannot be blank")
  await t.throws(publish({ identity: 1234 }), TypeError, "identity must be a string")

  const hIdentity = blake2b(Buffer.from(opts.identity)).toString('hex')
  await publish(opts, (err, { returnValues }) => {
    t.true(null == err && hIdentity == returnValues.identity)
  })
})

test(`resolve(identity = '')`, async (t) => {
  await t.throws(publish(), TypeError, "identity cannot be blank")
  await t.throws(publish(1234), TypeError, "identity must be a string")

  const result = await resolve(opts.identity)
  t.true(opts.root === result.root && opts.signature === result.signature)
})

// TODO(cckelly): unlink tests
