const { TEST_OWNER_DID_NO_METHOD } = require('./_constants')
const { createIdentityKeyPath } = require('ara-identity')
const mirror = require('mirror-folder')
const crypto = require('ara-crypto')
const { readFile } = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const pify = require('pify')

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

  async mirrorIdentity() {
    const publicKey = Buffer.from(TEST_OWNER_DID_NO_METHOD, 'hex')
    const hash = crypto.blake2b(publicKey).toString('hex')
    const path = `${__dirname}/fixtures/identities`
    const ddoPath = resolve(path, hash, 'ddo.json')
    const ddo = JSON.parse(await pify(readFile)(ddoPath, 'utf8'))
    const identityPath = createIdentityKeyPath(ddo)
    const parsed = parse(identityPath)
    await pify(mkdirp)(parsed.dir)
    await pify(mirror)(resolve(path, hash), identityPath)
    return { ddo, did: TEST_OWNER_DID_NO_METHOD }
  },

  async cleanup({ context }) {
    const { idPath, afsPath } = context
    if (idPath && afsPath) {
      await pify(rimraf)(idPath)
      await pify(rimraf)(afsPath)
    }
  }

}
