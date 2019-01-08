/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:add')
const mirror = require('mirror-folder')
const ignored = require('./lib/ignore')
const { create } = require('./create')
const isFile = require('is-file')
const mkdirp = require('mkdirp')
const { access } = require('fs')
const pify = require('pify')

const {
  join,
  basename,
  resolve
} = require('path')

/**
 * Adds one or more files to the AFS
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {Object}   [opts.keyringOpts]
 * @param {Boolean}  opts.force
 * @param {Array}    opts.paths
 * @return {Object}
 */
async function add(opts) {
  if (null === opts.did || 'string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty DID.')
  } else if (null === opts.password || 'string' !== typeof opts.password || !opts.password) {
    throw new TypeError('Password required to continue.')
  } else if (null === opts.paths || (!(opts.paths instanceof Array)
    && 'string' !== typeof opts.paths) || 0 === opts.paths.length) {
    throw new TypeError('Expecting one or more filepaths to add.')
  }

  const {
    keyringOpts,
    password,
    force,
    did
  } = opts

  let { paths } = opts

  if ('string' === typeof opts.paths) {
    paths = [ opts.paths ]
  }

  let afs
  try {
    ({ afs } = await create({ did, password, keyringOpts }))
  } catch (err) {
    throw err
  }

  await mirrorPaths(paths)

  debug('full copy complete')
  debug(await afs.readdir(afs.HOME))

  return afs

  async function mirrorPaths(p) {
    for (const path of p) {
      try {
        await pify(access)(resolve(path))
        await mirrorPath(path)
      } catch (err) {
        debug('%s does not exist', path)
      }
    }
  }

  async function mirrorPath(path) {
    debug(`copy start: ${path}`)
    const name = join(afs.HOME, basename(path))
    // Check if file
    if (!(await pify(isFile)(path)) && !ignore(path)) {
      await pify(mkdirp)(name, { fs: afs })
    }
    // Mirror and log
    const progress = mirror({ name: path }, { name, fs: afs }, { keepExisting: true, ignore })
    progress.on('put', (src, dst) => {
      debug(`adding path ${dst.name}`)
    })
    progress.on('skip', (src, dst) => {
      debug(`skipping path ${dst.name}`)
    })
    progress.on('ignore', (src, dst) => {
      debug(`ignoring path ${dst.name}. Use '--force' to force add file`)
    })
    progress.on('del', (dst) => {
      debug(`deleting path ${dst.name}`)
    })

    // Await end or error
    const error = await new Promise((accept, reject) => progress.once('end', accept).once('error', reject))

    if (error) {
      debug(`copy error: ${path}: ${error}`)
    } else {
      debug(`copy complete: ${path}`)
    }
  }

  function ignore(path) {
    if (ignored.ignores(path)) {
      if (force) {
        debug(`forcing add path ${path}`)
        return false
      }
      return true
    }
    return false
  }
}

module.exports = {
  add
}
