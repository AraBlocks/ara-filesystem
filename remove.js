/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:remove')
const { create } = require('./create')

const {
  resolve,
  join
} = require('path')

async function remove(opts) {
  if (null == opts.did || 'string' !== typeof opts.did || !opts.did) {
    throw new TypeError('ara-filesystem.remove: Expecting non-empty did.')
  }

  if (null == opts.password || 'string' !== typeof opts.password || !opts.password) {
    throw new TypeError('ara-filesystem.remove: Password required to continue')
  }

  if (null === opts.paths || (!(opts.paths instanceof Array)
    && 'string' !== typeof opts.paths) || 0 === opts.paths.length) {
    throw new TypeError('ara-filesystem.remove: Expecting one or more filepaths to remove')
  }

  const { did, password, paths } = opts

  let afs
  try {
    ({ afs } = await create({ did, password }))
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
