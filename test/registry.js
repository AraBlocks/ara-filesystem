const registry = require('ara-contracts/registry')
const test = require('ava')

const { isAddress } = require('ara-util/web3')

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

test.serial('deployNewStandard()', async (t) => {
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

test.serial('deployNewStandard() uncompilable standard', async (t) => {
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

test.serial('deployNewStandard() standard version exists', async (t) => {
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

test.serial('proxyExists() does not exist', async (t) => {
  let exists = await registry.proxyExists('')
  t.false(exists)
  exists = await registry.proxyExists(contentDid)
  t.false(exists)
})

test.serial('deployProxy()', async (t) => {
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

test.serial('upgradeProxy()', async (t) => {
  const { afs } = await createAFS(t)
  const { did } = afs

  await registry.deployProxy({
    contentDid: did,
    password,
    version: '1'
  })
  const upgraded = await registry.upgradeProxy({
    contentDid: did,
    password,
    version: '2'
  })
  t.true(upgraded)
  const version = await registry.getProxyVersion(did)
  t.is(version, '2')
})

test.serial('deployNewStandard() invalid opts', async (t) => {
  const owner = getDid(t)

  await t.throwsAsync(registry.deployNewStandard(), TypeError)
  await t.throwsAsync(registry.deployNewStandard('opts'), TypeError)
  await t.throwsAsync(registry.deployNewStandard({ }), TypeError)

  await t.throwsAsync(registry.deployNewStandard({ requesterDid: '' }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({ requesterDid: 'did:ara:invalid' }), TypeError)

  await t.throwsAsync(registry.deployNewStandard({ requesterDid: owner, password: '' }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({ requesterDid: owner, password: 18 }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({ requesterDid: owner, password: 'notright' }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({ requesterDid: owner, password }), TypeError)

  await t.throwsAsync(registry.deployNewStandard({ requesterDid: owner, password, paths: [] }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({ requesterDid: owner, password, paths: [ './path' ] }), TypeError)

  await t.throwsAsync(registry.deployNewStandard({
    requesterDid: owner,
    password,
    paths: [ './path' ],
    version: null
  }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({
    requesterDid: owner,
    password,
    paths: [ './path' ],
    version: false
  }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({
    requesterDid: 'did:ara:invalid',
    password,
    paths: [ './path' ],
    version: '1'
  }), Error)
  await t.throwsAsync(registry.deployNewStandard({
    requesterDid: owner,
    password: '',
    paths: [ './path' ],
    version: '1'
  }), TypeError)
  await t.throwsAsync(registry.deployNewStandard({
    requesterDid: owner,
    password: '',
    paths: [ ],
    version: '1'
  }), TypeError)
})

test.serial('deployProxy() invalid opts', async (t) => {
  const { afs } = await createAFS(t)
  const { did } = afs

  await t.throwsAsync(registry.deployProxy(), TypeError)
  await t.throwsAsync(registry.deployProxy('opts'), TypeError)
  await t.throwsAsync(registry.deployProxy({ }), TypeError)

  await t.throwsAsync(registry.deployProxy({ did: '' }), TypeError)
  await t.throwsAsync(registry.deployProxy({ did: 'did:ara:invalid' }), TypeError)

  await t.throwsAsync(registry.deployProxy({ did, password: '' }), TypeError)
  await t.throwsAsync(registry.deployProxy({ did, password: 18 }), TypeError)
  await t.throwsAsync(registry.deployProxy({ did, password: 'notright' }), Error)

  await t.throwsAsync(registry.deployProxy({ did, password, version: true }), Error)
  await t.throwsAsync(registry.deployProxy({ did, password, version: { } }), Error)
  await t.throwsAsync(registry.deployProxy({ did: 'did:ara:invalid', password, version: '1' }))
  await t.throwsAsync(registry.deployProxy({ did, password: 'invalid', version: '1' }))
})

test.serial('upgradeProxy() invalid opts', async (t) => {
  await t.throwsAsync(registry.upgradeProxy(), TypeError)
  await t.throwsAsync(registry.upgradeProxy('opts'), TypeError)
  await t.throwsAsync(registry.upgradeProxy({ }), TypeError)

  await t.throwsAsync(registry.upgradeProxy({ did: '' }), TypeError)
  await t.throwsAsync(registry.upgradeProxy({ did: 'did:ara:invalid' }), TypeError)

  const { afs } = await createAFS(t)
  const { did } = afs

  await t.throwsAsync(registry.upgradeProxy({ did, password: '' }), TypeError)
  await t.throwsAsync(registry.upgradeProxy({ did, password: 18 }), TypeError)
  await t.throwsAsync(registry.upgradeProxy({ did, password: 'notright' }), Error)

  await t.throwsAsync(registry.upgradeProxy({ did, password, version: true }), Error)
  await t.throwsAsync(registry.upgradeProxy({ did, password, version: { } }), Error)
  await t.throwsAsync(registry.upgradeProxy({ did: 'did:ara:invalid', password, version: '1' }))
  await t.throwsAsync(registry.upgradeProxy({ did, password: 'invalid', version: '1' }))
  await t.throwsAsync(registry.upgradeProxy({ did, password, version: '10000' }))
})
