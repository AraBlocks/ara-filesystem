/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:remove')
const { create } = require('./create')
const extend = require('extend')
const rc = require('./rc')()

const {
  join,
  resolve
} = require('path')

/**
 * Removes one or more files to the AFS
 * @param {Object}   opts
 * @param {String}   opts.did
 * @param {String}   opts.password
 * @param {Array}    opts.paths
 * @return {Object}
 */
async function remove(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty did.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw new TypeError('Password required to continue.')
  } else if (null === opts.paths || (!(opts.paths instanceof Array)
    && 'string' !== typeof opts.paths) || 0 === opts.paths.length) {
    throw new TypeError('Expecting one or more filepaths to add.')
  } else if (!opts.keyringOpts) {
    throw new MissingOptionError({ expectedKey: 'keyringOpts', actualValue: opts })
  } else if (!opts.keyringOpts.secret) {
    throw new MissingOptionError({ expectedKey: 'keyringOpts.secret', actualValue: opts.keyringOpts })
  } else if (!opts.keyringOpts.network && !rc.network.resolver) {
    throw new MissingOptionError({ expectedKey: 'keyringOpts.network or rc.network.resolver', actualValue: { keyringOpts: opts.keyringOpts, rc } })
  } else if (!opts.keyringOpts.keyring && !rc.network.identity.keyring) {
    throw new MissingOptionError({ expectedKey: 'keyringOpts.keyring or rc.network.identity.keyring', actualValue: { keyringOpts: opts.keyringOpts, rc } })
  }

  const { did, password, paths } = opts
  let { keyringOpts } = opts

  // Replace everything in the first object with the second. This method will allow us to have defaults.
  keyringOpts = extend(true, { network: rc.network.resolver, keyring: rc.network.identity.keyring }, keyringOpts)

  let afs
  try {
    ({ afs } = await create({ did, password, keyringOpts }))
  } catch (err) {
    throw err
  }
  await removeAll(paths)

  async function removeAll(files) {
    for (const path of files) {
      try {
        await afs.access(path)
        const nestedFiles = await afs.readdir(path)
        debug('%s removed from afs', path)
        await afs.unlink(path)

        if (nestedFiles.length > 0) {
          const src = resolve(path)
          for (let i = 0; i < nestedFiles.length; i++) {
            const file = nestedFiles[i]
            nestedFiles[i] = join(src, file)
            nestedFiles[i] = nestedFiles[i].replace(process.cwd(), '.')
          }

          await removeAll(nestedFiles)
        }
      } catch (err) {
        debug('%s does not exist', path)
      }
    }
  }

  return afs
}

module.exports = {
  remove
}
