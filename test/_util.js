const { createIdentityKeyPath } = require('ara-identity')
const { createAFSKeyPath } = require('../key-path')
const { getIdentifier } = require('ara-util')
const { create } = require('../create')
const mirror = require('mirror-folder')
const crypto = require('ara-crypto')
const { readFile } = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const pify = require('pify')

const {
  TEST_OWNER_DID_NO_METHOD,
  PASSWORD: password,
  TEST_IDENTITIES
} = require('./_constants')

const {
  resolve,
  parse
} = require('path')

module.exports = {

  kPassword: 'pass',

  kPrefix: 'did:ara:',

  kRandomEthAddress: '0xef61059258414a65bf2d94a4fd3b503b5fee8b48',

  getDID({ context }) {
    return context.did.did
  },

  getAccount({ context }) {
    return context.account
  },

  async mirrorIdentity(did = TEST_OWNER_DID_NO_METHOD) {
    did = getIdentifier(did)
    const publicKey = Buffer.from(did, 'hex')
    const hash = crypto.blake2b(publicKey).toString('hex')
    const path = `${__dirname}/fixtures/identities`
    const ddoPath = resolve(path, hash, 'ddo.json')
    const ddo = JSON.parse(await pify(readFile)(ddoPath, 'utf8'))
    const identityPath = createIdentityKeyPath(ddo)
    const parsed = parse(identityPath)
    await pify(mkdirp)(parsed.dir)
    await pify(mirror)(resolve(path, hash), identityPath)
    return { ddo, did }
  },

  async mirrorIdentities() {
    const identities = []
    for (const identity of TEST_IDENTITIES) {
      // eslint-disable-next-line no-await-in-loop
      identities.push(await module.exports.mirrorIdentity(identity))
    }
    return identities
  },

  async createAFS({ context }) {
    let did
    let ddo
    const { identities } = context
    if (Array.isArray(identities) && 0 < identities.length) {
      const index = 0;
      ({ did, ddo } = identities[index])
    } else {
      ({ did, ddo } = context)
    }
    let afs
    let mnemonic
    try {
      // eslint-disable-next-line semi
      ({ afs, mnemonic } = await create({ owner: did, password, ddo }))
    } catch (err) {
      console.log(err)
    }
    return {
      idPath: createIdentityKeyPath(afs.ddo),
      afsPath: createAFSKeyPath(afs.did),
      mnemonic,
      afs
    }
  },

  async cleanup({ context }) {
    const { idPath, afsPath } = context
    if (idPath && afsPath) {
      await pify(rimraf)(idPath)
      await pify(rimraf)(afsPath)
    }
  }

}
