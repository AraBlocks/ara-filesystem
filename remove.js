/* eslint quotes: "off" */

const { create } = require('./create')

async function remove({
  paths = [],
  did = '',
  password = ''
} = {}) {
  if (0 === paths.length) {
    throw new Error("No path(s) provided.")
  }

  const { afs } = await create({ did, password })
  for (const path of paths) {
    if ('string' !== typeof path) {
      throw new Error("Path found that is not of type string", path)
    }
    try {
      if (await afs.access(path)) {
        await afs.unlink(path)
      }
    } catch (err) {
      await afs.close()
      return new Error("Could not remove file either because it does not exist or because of inadequate permissions")
    }
  }
  await afs.close()
  return null
}

module.exports = {
  remove
}
