'use strict'

const debug = require('debug')('ara-filesystem:create')
const fs = require('fs')
const aid = require('./aid')
const path = require('path')
const pify = require('pify')

const kIdentitiesDir = path.join(require('os').homedir(), '.ara', 'identities')

/**
 * Creates an AFS with the given Ara identity
 * @param  {string} did
 * @return {Promise}
 */
async function create(did = '') {

  if (!did) {
    // check for local identities
    try {
      await pify(fs.access)(kIdentitiesDir)
      const identities = await pify(fs.readdir)(kIdentitiesDir)
      did = await aid.getLocalIdentity({ dir: kIdentitiesDir, identities })
    } catch (err) { debug(err.stack || err) }
  }

  if ('string' != typeof did) {
    throw new TypeError('ara-filesystem.create: Expecting non-empty string.')
  }

  const result = await aid.resolve(did)
  debug(result)

}

module.exports = {
  create
}
