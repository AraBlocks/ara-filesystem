const debug = require('debug')('ara-filesystem:remove')
const { create } = require('./create')
const pify = require('pify')
const { resolve, join } = require('path')

async function remove({
  paths = [],
  did = '',
  password = ''
} = {}) {
  const { afs } = await create({ did, password })
  
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
