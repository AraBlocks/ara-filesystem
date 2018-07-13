/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:remove')
const { create } = require('./create')
const pify = require('pify')
const { resolve, join } = require('path')

async function remove({
  did = '',
  paths = [],
  password = ''
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
    ({ afs } = await create({ did, password }))
  } catch (err) {
    throw err
  }
  
  await removeAll(paths)

  async function removeAll(paths) {

    for (const path of paths) {
      try {
        await afs.access(path)
      } catch (err) {
        debug('%s does not exist', path)
        continue
      }

      try {
        const files = await afs.readdir(path)
        debug('%s removed from afs', path)
        await afs.unlink(path)

        if (files.length > 0) {
          const src = resolve(path)
          for (let i = 0; i < files.length; i++) {
            let file = files[i]
            files[i] = join(src, file)
            files[i] = files[i].replace(process.cwd(), '.')
          } 

          await removeAll(files)
        }
      } catch (err) {
        continue
      }
    }
  }

  afs.close()
}

module.exports = {
  remove
}
