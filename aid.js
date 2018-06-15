'use strict'

const debug = require('debug')('ara-filesystem:aid')
const path = require('path')
const fs = require('fs')
const aid = require('ara-identity')
const pify = require('pify')
const crypto = require('ara-crypto')
const context = require('ara-context')()
const { DIDDocument, Authentication } = require('did-document')
const { kEd25519VerificationKey2018 } = require('ld-cryptosuite-registry')

const kDDOFilename = 'ddo.json'
const kDIDPrefix = 'did:ara:'
const kKeyOwner = '#owner' // TODO: Support many keys

async function create(publicKey) {
  const password = crypto.randomBytes(32).toString()
  let identity
  try {
    publicKey += kKeyOwner
    const did = { authentication: { type: kEd25519VerificationKey2018, publicKey } }
    identity = await aid.create({ context, password, did })
  } catch (err) { debug(err.stack || err) }
  return identity
}

async function archive(identity, opts) {
  try { await aid.archive(identity, opts) }
  catch (err) { debug(err.stack || err) }
}

/**
 * Resolve an Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function resolve(did, opts = {}) {

  const prefix = did.substring(0, kDIDPrefix.length)
  if (prefix != kDIDPrefix) {
    did = kDIDPrefix + did
  }

  if (!opts.cache) {
    opts = Object.assign(opts, { cache: true })
  }

  let result
  try {
    result = await aid.resolve(did, opts)
  } catch (err) { debug(err.stack || err) }

  return result
}

module.exports = {
  archive,
  create,
  resolve
}
