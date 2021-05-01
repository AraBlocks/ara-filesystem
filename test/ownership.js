/* eslint quotes: "off" */

const { getContext } = require('ara-util/web3')
const test = require('ava')

const {
  getAddressFromDID,
  getDocumentOwner,
  validate
} = require('ara-util')

const {
  REQUEST_OWNER_ADDRESS,
  PASSWORD: password,
  AFS_PASSWORD: afsPassword
} = require('./_constants')

const {
  ownership,
  deploy
} = require('../')

const {
  mirrorIdentities,
  createAFS,
  cleanup
} = require('./_util')

const getAFS = ({ context }) => {
  const { afs } = context.afs
  return afs
}

const getAFSMnemonic = ({ context }) => {
  const { mnemonic } = context.afs
  return mnemonic
}

const getIdentity = ({ context }, index = 1) => {
  const { identities } = context
  return identities[index]
}

const REQUESTER_MNEMONIC = 'okay eager danger parrot leave depend paper ready isolate grass miss equip'

test.before(async (t) => {
  t.context.identities = await mirrorIdentities()

  const ctx = getContext()
  await ctx.ready()

  const { web3 } = ctx
  const accounts = await web3.eth.getAccounts()

  // fund ownership requesting account
  await web3.eth.sendTransaction({
    to: REQUEST_OWNER_ADDRESS,
    value: web3.utils.toWei('1'),
    from: accounts[0],
  })
  ctx.close()
})

test.beforeEach(async (t) => {
  t.context.afs = await createAFS(t)
})

test.afterEach(async t => cleanup(t))

test.serial('request(opts) valid request', async (t) => {
  const { did } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)
  await deploy({ did, password, afsPassword })

  const receipt = await ownership.request({
    contentDid: did,
    requesterDid,
    password
  })
  t.true(receipt && 'object' === typeof receipt)

  // error on re-request
  await t.throwsAsync(ownership.request({
    contentDid: did,
    requesterDid,
    password
  }), { instanceOf: Error })

  const requested = await ownership.hasRequested({
    contentDid: did,
    requesterDid
  })
  t.is(true, requested)
})

test.serial('revokeRequest(opts) valid revocation', async (t) => {
  const { did } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)
  await deploy({ did, password, afsPassword })

  // try to revoke non-existent request
  await t.throwsAsync(ownership.revokeRequest({
    contentDid: did,
    requesterDid,
    password
  }), { instanceOf: Error })

  await ownership.request({
    contentDid: did,
    requesterDid,
    password
  })

  const receipt = await ownership.revokeRequest({
    contentDid: did,
    requesterDid,
    password
  })
  t.true(receipt && 'object' === typeof receipt)

  // verify request has already been revoked
  await t.throwsAsync(ownership.revokeRequest({
    contentDid: did,
    requesterDid,
    password
  }), { instanceOf: Error })

  const requested = await ownership.hasRequested({
    contentDid: did,
    requesterDid
  })
  t.is(false, requested)
})

test.serial(`request(opts) revokeRequest(opts)
  proxy not deployed`, async (t) => {
  const funcs = [ ownership.request, ownership.revokeRequest ]
  const { did: contentDid } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)

  const promises = []
  for (const func of funcs) {
    promises.push(t.throwsAsync(func({
      requesterDid,
      contentDid,
      password
    })))
  }
  await Promise.all(promises)
})

test.serial("approveTransfer(opts) proxy not deployed", async (t) => {
  const { did: contentDid } = getAFS(t)
  const { did: newOwnerDid } = getIdentity(t)

  const mnemonic = getAFSMnemonic(t)
  await t.throwsAsync(ownership.approveTransfer({
    afsPassword,
    newOwnerDid,
    contentDid,
    mnemonic,
    password
  }), { instanceOf: Error })
})

test.serial("approveTransfer(opts) has not requested", async (t) => {
  const { did: contentDid } = getAFS(t)
  const { did: newOwnerDid } = getIdentity(t)

  const mnemonic = getAFSMnemonic(t)

  await deploy({ did: contentDid, password, afsPassword })

  await t.throwsAsync(ownership.approveTransfer({
    afsPassword,
    newOwnerDid,
    contentDid,
    mnemonic,
    password
  }), { instanceOf: Error })
})

test.serial("approveTransfer(opts) valid approve", async (t) => {
  const { did: contentDid } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)

  await deploy({ did: contentDid, password, afsPassword })

  const prevOwner = await ownership.getOwner(contentDid)
  const requesterAddr = await getAddressFromDID(requesterDid)
  t.true(prevOwner.toLowerCase() !== requesterAddr)

  // send ownership request
  await ownership.request({
    requesterDid,
    contentDid,
    password
  })

  const mnemonic = getAFSMnemonic(t)
  const { receipt, password: generatedPassword } = await ownership.approveTransfer({
    newOwnerDid: requesterDid,
    afsPassword,
    contentDid,
    mnemonic,
    password
  })
  t.true(receipt && 'object' === typeof receipt)
  t.true(generatedPassword && 'string' === typeof generatedPassword)

  const newOwner = await ownership.getOwner(contentDid)
  t.true(newOwner.toLowerCase() === requesterAddr)
})

test.serial("claim(opts) valid claim", async (t) => {
  const { did: contentDid } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)

  await deploy({ did: contentDid, password, afsPassword })

  // send ownership request
  await ownership.request({
    requesterDid,
    contentDid,
    password
  })

  const { ddo: prevOwnerDdo } = await validate({ did: contentDid, password: afsPassword })
  const { did: prevOwner } = getIdentity(t, 0)
  t.is(prevOwner, getDocumentOwner(prevOwnerDdo, true))

  const mnemonic = getAFSMnemonic(t)
  const { password: currentPassword } = await ownership.approveTransfer({
    newOwnerDid: requesterDid,
    afsPassword,
    contentDid,
    mnemonic,
    password
  })

  const newPassword = 'new_pass'
  await ownership.claim({
    currentPassword,
    newPassword,
    contentDid,
    mnemonic
  })

  // prove this doesn't throw error
  const { ddo: newOwnerDdo } = await validate({ did: contentDid, password: newPassword })
  t.is(requesterDid, getDocumentOwner(newOwnerDdo, true))
})

test.serial(`estimateRequestGasCost(opts) estimateRevokeGasCost() 
  proxy not deployed`, async (t) => {
  const funcs = [ ownership.estimateRequestGasCost, ownership.estimateRevokeGasCost ]
  const { did: contentDid } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)

  const promises = []
  for (const func of funcs) {
    promises.push(t.throwsAsync(func({
      requesterDid,
      contentDid,
      password
    }), { instanceOf: Error }))
  }

  await Promise.all(promises)
})

test.serial(`estimateRequestGasCost(opts) estimateRevokeGasCost() 
  valid request`, async (t) => {
  const funcs = [ ownership.estimateRequestGasCost, ownership.estimateRevokeGasCost ]
  const { did } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)
  await deploy({ did, password, afsPassword })

  const promises = []
  for (const func of funcs) {
    promises.push(new Promise(async (resolve) => {
      const cost = await func({
        contentDid: did,
        requesterDid,
        password
      })
      t.true('string' === typeof cost)
      t.true(0 < Number(cost))
      resolve()
    }))
  }

  await Promise.all(promises)
})

test.serial("estimateApproveGasCost(opts) proxy not deployed", async (t) => {
  const { did } = getAFS(t)
  const { did: newOwnerDid } = getIdentity(t)

  await t.throwsAsync(ownership.estimateApproveGasCost({
    mnemonic: REQUESTER_MNEMONIC,
    afsPassword,
    newOwnerDid,
    password,
    did
  }), { instanceOf: Error })
})

test.serial("estimateApproveGasCost(opts) valid request", async (t) => {
  const { did } = getAFS(t)
  const { did: requesterDid } = getIdentity(t)

  await deploy({ did, password, afsPassword })
  const cost = await ownership.estimateRequestGasCost({
    contentDid: did,
    requesterDid,
    password
  })
  t.true('string' === typeof cost)
  t.true(0 < Number(cost))
})

test.serial("request(opts) revokeRequest(opts) invalid opts", async (t) => {
  const { did: contentDid } = getAFS(t)
  const funcs = [ ownership.request, ownership.revokeRequest ]

  const promises = []
  for (const func of funcs) {
    promises.push(new Promise(async (resolve) => {
      // opts
      await t.throwsAsync(func(), { instanceOf: TypeError })
      await t.throwsAsync(func('opts'), { instanceOf: TypeError })
      await t.throwsAsync(func({ }), { instanceOf: TypeError })

      // contentDid
      await t.throwsAsync(func({ contentDid: 'did:ara:1234' }), { instanceOf: Error })
      await t.throwsAsync(func({ contentDid: 0x123 }), { instanceOf: TypeError })
      await t.throwsAsync(func({ contentDid: 123 }), { instanceOf: TypeError })
      await t.throwsAsync(func({ contentDid: null }), { instanceOf: TypeError })

      // requesterDid
      await t.throwsAsync(func({ contentDid, requesterDid: 'did:ara:1234 ' }), { instanceOf: Error })
      await t.throwsAsync(func({ contentDid, requesterDid: 0x123 }), { instanceOf: TypeError })
      await t.throwsAsync(func({ contentDid, requesterDid: 123 }), { instanceOf: TypeError })
      await t.throwsAsync(func({ contentDid, requesterDid: null }), { instanceOf: TypeError })

      const requesterDid = getIdentity(t)

      // password
      await t.throwsAsync(func({ contentDid, requesterDid }), { instanceOf: TypeError })
      await t.throwsAsync(func({ contentDid, requesterDid, password: '' }), { instanceOf: TypeError })
      await t.throwsAsync(func({ contentDid, requesterDid, password: 123 }), { instanceOf: TypeError })

      // estimate
      await t.throwsAsync(func({
        contentDid, requesterDid, password, estimate: 'false'
      }), { instanceOf: Error })

      resolve()
    }))
  }

  await Promise.all(promises)
})

test.serial("approveTransfer(opts) invalid opts", async (t) => {
  const { did } = getAFS(t)
  const mnemonic = REQUESTER_MNEMONIC
  const newOwnerDid = getIdentity(t)

  // opts
  await t.throwsAsync(ownership.approveTransfer(), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer('opts'), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ }), { instanceOf: TypeError })

  // mnemonic
  await t.throwsAsync(ownership.approveTransfer({ mnemonic: '' }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic: null }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic: 123 }), { instanceOf: TypeError })

  // newOwnerDid
  await t.throwsAsync(ownership.approveTransfer({ mnemonic }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid: 'did:ara:1234' }), { instanceOf: Error })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid: 0x123 }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid: 123 }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid: null }), { instanceOf: TypeError })

  // did
  await t.throwsAsync(ownership.approveTransfer({ mnemonic }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid, did: 'did:ara:1234' }), { instanceOf: Error })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid, did: 0x123 }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid, did: 123 }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid, did: null }), { instanceOf: TypeError })

  // password
  await t.throwsAsync(ownership.approveTransfer({ mnemonic, newOwnerDid, did }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({
    mnemonic, newOwnerDid, did, password: ''
  }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.approveTransfer({
    mnemonic, newOwnerDid, did, password: 123
  }), { instanceOf: TypeError })

  // estimate
  await t.throwsAsync(ownership.approveTransfer({
    mnemonic, newOwnerDid, did, password, estimate: 'false'
  }), { instanceOf: Error })
})

test.serial("claim(opts) invalid opts", async (t) => {
  // opts
  await t.throwsAsync(ownership.claim(), { instanceOf: TypeError })
  await t.throwsAsync(ownership.claim('opts'), { instanceOf: TypeError })
  await t.throwsAsync(ownership.claim({ }), { instanceOf: TypeError })

  // currentPassword
  await t.throwsAsync(ownership.claim({ currentPassword: '' }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.claim({ currentPassword: 123 }), { instanceOf: TypeError })

  const currentPassword = 'current_pass'
  // newPassword
  await t.throwsAsync(ownership.claim({ currentPassword, newPassword: '' }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.claim({ currentPassword, newPassword: 123 }), { instanceOf: TypeError })

  const newPassword = 'new_pass'
  // mnemonic
  await t.throwsAsync(ownership.claim({ currentPassword, newPassword, mnemonic: '' }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.claim({ currentPassword, newPassword, mnemonic: null }), { instanceOf: TypeError })
  await t.throwsAsync(ownership.claim({ currentPassword, newPassword, mnemonic: 123 }), { instanceOf: TypeError })
})
