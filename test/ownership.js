/* eslint quotes: off */

const test = require('ava')
const { blake2b } = require('ara-crypto')
const { kTestDid } = require('./_constants')
const { publish, resolve } = require('../ownership')

const opts = {
  identity: kTestDid,
  root: 'root',
  signature: 'signature'
}

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
