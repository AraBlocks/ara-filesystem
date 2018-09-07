const debug = require('debug')('ara-filesystem:unarchive')
const mirror = require('mirror-folder')
const { create } = require('./create')

const {
  resolve,
  isAbsolute
} = require('path')

/**
 * Unarchives the AFS with the given Ara identity
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.path
 * @return {Object}
 */
async function unarchive(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if (!opts.did || 'string' !== typeof opts.did) {
    throw new TypeError('DID URI must be of type string.')
  } else if (opts.path && 'string' !== typeof opts.path) {
    throw new TypeError('Path must be of type string.')
  }

  const { did } = opts
  const { afs } = await create({ did })

  try {
    const result = await afs.readdir(afs.HOME)
    if (0 === result.length) {
      throw new Error('Can only unarchive a non-empty AFS.')
    }
  } catch (err) {
    throw err
  }

  let path = opts.path || __dirname
  if (!isAbsolute(path)) {
    path = resolve(path)
  }

  const progress = mirror({
    name: afs.HOME,
    fs: afs
  }, { name: path }, { keepExisting: true })

  progress.on('put', (src) => {
    debug('onput', src.name)
  })

  progress.on('skip', (src) => {
    debug('onskip', src.name)
  })

  // Await end or error
  const error = await new Promise((accept, reject) => progress.once('end', accept).once('error', reject))
  afs.close()

  if (error) {
    debug(`unarchive error: ${path}: ${error}`)
  } else {
    debug(`unarchive complete: ${path}`)
  }
}

module.exports = {
  unarchive
}
