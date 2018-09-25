const registry = require('ara-contracts/registry')
const test = require('ava')

const { isAddress } = require('ara-util/web3')

const {
  TEST_OWNER_DID,
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

const getDdo = (t) => {
  const { ddo } = t.context
  return ddo
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
})

test.afterEach(async (t) => {
  await cleanup(t)
})

test.serial('deploy() valid standard', async (t) => {
  const owner = getDid(t)
  const paths = [ 'node_modules/ara-contracts/contracts/AFS.sol', 'node_modules/ara-contracts/contracts/Library.sol', 'node_modules/ara-contracts/contracts/Registry.sol', 'node_modules/ara-contracts/contracts/Proxy.sol', 'node_modules/ara-contracts/contracts/AraToken.sol' ]
  const version = '2'
  const address = await registry.deployNewStandard({
    requesterDid: owner,
    password,
    version,
    paths
  })
  t.true(isAddress(address))
  const latest = await registry.getLatestStandard()
  t.is(address, latest)
  const standard = await registry.getStandard(version)
  t.is(address, standard)
})

test.serial('deploy() uncompilable standard', async (t) => {
  const owner = getDid(t)
  const paths = []
  const version = '3'
  await t.throwsAsync(registry.deployNewStandard({
    requesterDid: owner,
    password,
    version,
    paths
  }), Error, 'Failed to compile standard.')
})

test.serial('deploy() standard version exists', async (t) => {
  const owner = getDid(t)
  const paths = [ 'node_modules/ara-contracts/contracts/AFS.sol', 'node_modules/ara-contracts/contracts/Library.sol', 'node_modules/ara-contracts/contracts/Registry.sol', 'node_modules/ara-contracts/contracts/Proxy.sol', 'node_modules/ara-contracts/contracts/AraToken.sol' ]
  const version = '2'
  await t.throwsAsync(registry.deployNewStandard({
    requesterDid: owner,
    password,
    version,
    paths
  }), Error, 'Standard version already exists.')
})

test.serial('deploy() proxy', async (t) => {
  const { afs } = await createAFS(t)
  const { did } = afs

  const deployedAddress = await registry.deployProxy({
    contentDid: did,
    password,
    version: '2'
  })
  const exists = await registry.proxyExists(did)
  t.true(exists)
  const gotAddress = await registry.getProxyAddress(did)
  t.is(gotAddress, deployedAddress)
})

test.serial('upgrade() proxy', async (t) => {
  const { afs } = await createAFS(t)
  const { did } = afs

  const deployedAddress = await registry.deployProxy({
    contentDid: did,
    password,
    version: '2'
  })
})
