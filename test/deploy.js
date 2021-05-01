/* eslint quotes: "off" */

const { PASSWORD: password, AFS_PASSWORD: afsPassword } = require('./_constants')
const { isAddress } = require('ara-util/web3')
const { deploy } = require('../deploy')
const test = require('ava')

const {
  mirrorIdentity,
  createAFS,
  cleanup
} = require('./_util')

const getAFS = ({ context }) => {
  const { afs } = context
  return afs
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
})

test.beforeEach(async (t) => {
  t.context = await createAFS(t)
})

test.afterEach(async t => cleanup(t))

test("deploy() invalid opts", async (t) => {
  const { did } = t.context

  // opts
  await t.throwsAsync(deploy(), { instanceOf: TypeError })
  await t.throwsAsync(deploy('opts'), { instanceOf: TypeError })
  await t.throwsAsync(deploy({ }), { instanceOf: TypeError })

  // did
  await t.throwsAsync(deploy({ did: 'did:ara:1234' }), { instanceOf: Error })
  await t.throwsAsync(deploy({ did: 0x123 }), { instanceOf: TypeError })
  await t.throwsAsync(deploy({ did: 123 }), { instanceOf: TypeError })
  await t.throwsAsync(deploy({ did: null }), { instanceOf: TypeError })

  // password
  await t.throwsAsync(deploy({ did }), { instanceOf: TypeError })
  await t.throwsAsync(deploy({ did, password: '' }), { instanceOf: Error })
  await t.throwsAsync(deploy({ did, password: 123 }), { instanceOf: Error })

  // estimate
  await t.throwsAsync(deploy({ did, password, estimate: 'false' }), { instanceOf: Error })
})

test.serial("deploy() cost estimate", async (t) => {
  const { did } = getAFS(t)
  await t.notThrowsAsync(deploy({
    did, password, estimate: true, afsPassword
  }))
  const cost = await deploy({
    did, password, estimate: true, afsPassword
  })
  t.true('string' === typeof cost)
  t.true(0 < Number(cost))
})

test.serial("deploy() valid deploy", async (t) => {
  const { did } = getAFS(t)
  const result = await deploy({ did, password, afsPassword })
  t.true(isAddress(result))
})

test.serial("deploy() prevent duplicate deploys", async (t) => {
  const { did } = getAFS(t)
  await deploy({ did, password, afsPassword })
  await t.throwsAsync(deploy({ did, password, afsPassword }), { instanceOf: Error })
})
