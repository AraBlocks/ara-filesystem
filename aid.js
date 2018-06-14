'use strict'

const debug = require('debug')('ara-filesystem:aid')
const path = require('path')
const fs = require('fs')
const aid = require('ara-identity')
const pify = require('pify')

const kDDOFilename = 'ddo.json'

/**
 * Resolve an Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function resolve(did) {
  return await aid.resolve(did, { cache: true })
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

module.exports = {
  resolve,
  getLocalIdentity
}
