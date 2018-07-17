/* eslint-disable no-await-in-loop */

const { resolve, join } = require('path')
const { create } = require('./create')
const debug = require('debug')('ara-filesystem:remove')

async function remove({
  did = '',
  paths = [],
  password = '',
  rootPath,
} = {}) {
  if (null == did || 'string' !== typeof did || !did) {
    throw new TypeError('ara-filesystem.remove: Expecting non-empty did.')
  }

  if (null == password || 'string' !== typeof password || !password) {
    throw new TypeError('ara-filesystem.remove: Password required to continue')
  }

  if (null === paths || (!(paths instanceof Array) && 'string' !== typeof paths) || paths.length == 0) {
    throw new TypeError('ara-filesystem.remove: Expecting one or more filepaths to remove')
  }

  let afs
  try {
    ({ afs } = await create({ rootPath, did, password }))
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
  afs.close()
}

module.exports = {
  remove
}
