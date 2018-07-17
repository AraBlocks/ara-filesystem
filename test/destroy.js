const test = require('ava')
const { create } = require('../create')
const { commit } = require('../commit')
const { access } = require('fs')
const { web3 } = require('ara-context')()
const { abi } = require('../build/contracts/Storage.json')
const pify = require('pify')
const { hashIdentity } = require('../util')
const { kStorageAddress } = require('../constants')

const {
  destroy,
  getAfsId
} = require('../destroy')

const {
  createIdentityKeyPath,
  createAFSKeyPath
} = require('../key-path')

const {
  kTestOwnerDid,
  kPassword: password
} = require('./_constants')

const getDid = ({ context }) => context.afs.did

test.before(async (t) => {
  const { afs, mnemonic } = await create({ owner: kTestOwnerDid, password })
  t.context.afs = afs
  t.context.mnemonic = mnemonic
})

test("destroy() invalid did", async (t) => {
  await t.throws(destroy(), TypeError, "Expecting non-empty string for DID")
  await t.throws(destroy({ did: 1234 }), TypeError, "Expecting non-empty string for DID")
})

test("destroy() invalid password", async (t) => {
  const did = getDid(t)
  await t.throws(destroy({ did }), TypeError, "Expecting non-empty string for password")
  await t.throws(destroy({ did, password: 1234 }), TypeError, "Expecting non-empty string for password")
})

test("destroy() invalid mnemonic", async (t) => {
  const did = getDid(t)
  await t.throws(destroy({ did, password }), TypeError, 
    "Expecting non-empty string for mnemonic")
  await t.throws(destroy({ did, password, mnemonic: 1234 }), TypeError, 
    "Expecting non-empty string for mnemonic")
})

test("destroy() incorrect password", async (t) => {
  const did = getDid(t)
  await t.throws(destroy({ did, password: 'wrongPass' }), Error, "Incorrect password")
})

test("destroy() incorrect mnemonic", async (t) => {
  const did = getDid(t)
  const mnemonic = "this is not the right mnemonic this is not the right mnemonic"
  await t.throws(destroy({ did, password, mnemonic }), Error, "Incorrect mnemonic")
})

test("destroy() valid params without commit", async (t) => {
  const did = getDid(t)
  const mnemonic = t.context.mnemonic

  const afsId = await getAfsId(did, mnemonic)

  // make sure paths exist before destroying
  const identityPath = createIdentityKeyPath(afsId)
  await t.notThrows(pify(access)(identityPath))
  const afsPath = createAFSKeyPath(did)
  await t.notThrows(pify(access)(afsPath))
  
  // destroy operation
  await t.notThrows(destroy({ did, password, mnemonic }))

  // ensure paths are removed
  await t.throws(pify(access)(identityPath))
  await t.throws(pify(access)(afsPath))

  t.pass()
})

test("destroy() valid params with commit", async (t) => {
  const { afs, mnemonic } = await create({ owner: kTestOwnerDid, password })
  const { did } = afs
  await commit({ did, password })

  const deployed = new web3.eth.Contract(abi, kStorageAddress)
  const accounts = await web3.eth.getAccounts()
  const hIdentity = hashIdentity(did)

  let mtBuf = await deployed.methods.read(hIdentity, 0, 0).call()
  let msBuf = await deployed.methods.read(hIdentity, 1, 0).call()
  const existsBefore = await deployed.methods.exists(hIdentity).call()

  await t.notThrows(destroy({ did, password, mnemonic }))

  // make sure read returns nothing after delete
  mtBuf = await deployed.methods.read(hIdentity, 0, 0).call()
  t.true(!mtBuf)

  msBuf = await deployed.methods.read(hIdentity, 1, 0).call()
  t.true(!msBuf)

  // make sure any writes not get reverted
  await t.throws(deployed.methods.write(hIdentity, 0, 0, '0x0101', false)
    .send({ from: accounts[0], gas: 500000 }), Error, "Writes are disabled after deletion")

  // make sure exists now is false
  const existsAfter = await deployed.methods.exists(hIdentity).call()
  t.true(existsBefore !== existsAfter)
})
