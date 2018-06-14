'use strict'

const debug = require('debug')('ara-filesystem:aid')
const path = require('path')
const fs = require('fs')
const aid = require('ara-identity')
const pify = require('pify')
const crypto = require('ara-crypto')
const context = require('ara-context')()
const { DIDDocument, Authentication } = require('did-document')

const kDDOFilename = 'ddo.json'
const kDIDPrefix = 'did:ara:'

async function create() {
  const password = crypto.randomBytes(32).toString()
  let identity
  try {
    identity = await aid.create({ context, password })
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

  // ensure properly formatted DID
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

/**
 * Resolve a local DID based on a path and index
 * @param  {string}   options.dir        
 * @param  {Object[]} options.identities 
 * @param  {string}   options.index      
 * @return {Promise}
 */
async function getLocalIdentity({dir, identities, index = 0} = {}) {

  if (0 < index) {
    index = Math.min(index, identities.length - 1)
  }

  // get local identity based on index
  const ddoPath = path.join(dir, identities[index], kDDOFilename)
  let buffer
  try {
    buffer = await pify(fs.readFile)(ddoPath)
  } catch (err) { debug(err.stack || err) }

  return buffer ? JSON.parse(buffer.toString()).id : {}
}

async function applyAuthentication(src, dst) {
  debug('applying authentication...')
}

module.exports = {
  archive,
  create,
  resolve,
  getLocalIdentity
}
