const debug = require('debug')('ara-filesystem:destroy')
const aid = require('./aid')
const { blake2b } = require('ara-crypto')
const { toHex } = require('ara-identity/util')
const { destroyCFS } = require('cfsnet/destroy')
const { createAFSKeyPath } = require('./key-path')
const { access } = require('fs')
const { kResolverKey } = require('./constants')
const rimraf = require('rimraf')
const pify = require('pify')

const {
  validate,
  getDocumentOwner,
  loadSecrets
} = require('./util')

const {
  basename,
  resolve: resolvePath
} = require('path')

async function destroy({
  did = '',
  mnemonic = '',
  password = ''
} = {}) {
  //await validate(did, password, 'destroy')
  let path = createAFSKeyPath(did)
  console.log('path1', path)
  const hash = basename(path)

  try {
    // delete AFS on disk
    //await pify(access)(path)
    //await pify(rimraf)(path)

    // destroy AFS identity
    const afsIdentity = await getAfsId(did, mnemonic)
    path = generateIdentityPath(afsIdentity)
    console.log('path2', path)
  } catch (err) {
    throw new Error(err)
  }

  // path = resolvePath(path.replace(hash, ''), kNodesDir, hash)
  // console.log('path3', path)

  // delete AFS toilet db file
  try {
    //await pify(access)(path)
    //await pify(rimraf)(path)
  } catch (err) {
    debug('db file at %s does not exist', path)
  }
}

async function getAfsId(did, mnemonic) {
  const keystore = await loadSecrets(kResolverKey)
  const afsDdo = await aid.resolve(did, { key: kResolverKey, keystore })
  const owner = getDocumentOwner(afsDdo)
  return await aid.create(mnemonic, owner)
}

function generateIdentityPath({ publicKey }) {
  return toHex(blake2b(publicKey))
}

module.exports = {
  destroy
}
