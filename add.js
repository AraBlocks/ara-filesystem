/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:add')
const { join, basename } = require('path')
const mirror = require('mirror-folder')
const ignored = require('./lib/ignore')
const { create } = require('./create')
const isFile = require('is-file')
const pify = require('pify')

async function add(opts) {
  if (null === opts.did || 'string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty DID.')
  }

  if (null === opts.password || 'string' !== typeof opts.password || !opts.password) {
    throw new TypeError('Password required to continue.')
  }

  if (null === opts.paths || (!(opts.paths instanceof Array)
    && 'string' !== typeof opts.paths) || 0 === opts.paths.length) {
    throw new TypeError('Expecting one or more filepaths to add.')
  }

  const {
    did, paths, password, force
  } = opts

  let afs
  try {
    ({ afs } = await create({ did, password }))
  } catch (err) {
    throw err
  }

  await mirrorPaths(paths)

  debug('full copy complete')
  debug(await afs.readdir(afs.HOME))

  return afs

  async function mirrorPaths(p) {
    for (const path of p) {
      await mirrorPath(path)
    }
  }

  async function mirrorPath(path) {
    debug(`copy start: ${path}`)
    let name = afs.HOME

    // Check if file
    if (await pify(isFile)(path)) {
      name = join(afs.HOME, basename(path))
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
    const error = await new Promise((resolve, reject) => progress.once('end', resolve).once('error', reject))

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
