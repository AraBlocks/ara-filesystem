const { purchase } = require('ara-contracts')
const { commit } = require('../commit')
const test = require('ava')

const {
  TEST_DID: contentDid,
  PASSWORD: password
} = require('./_constants')

const {
  mirrorIdentity,
  createAFS,
  cleanup
} = require('./_util')

const getDid = (t) => {
  const { did } = t.context
  return did
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
})

test.afterEach(async (t) => {
  await cleanup(t)
})

test.serial('purchase()', async (t) => {
  const owner = getDid(t)
  const { afs } = await createAFS(t)
  const { did } = afs
  const price = 100
  const receipt = await commit({ did, password, price })
  t.true(receipt.status)
  await t.notThrowsAsync(purchase({ requesterDid: owner, contentDid: did, password, budget: 0 }))
})
