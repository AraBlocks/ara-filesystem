const debug = require('debug')('ara-filesystem:remove')
const { create } = require('./create')
const pify = require('pify')

async function remove({
  paths = [],
  did = '',
  password = ''
} = {}) {
  const { afs } = await create({ did, password })
  for (const path of paths) {
    try {
      if (await afs.access(path)) {
        await afs.unlink(path)
      }
    } catch(err) {
      throw new Error("Could not remove file either because it does not exist or because of inadequate permissions")
    }
  }
  await afs.close()
}

module.exports = {
  remove
}
