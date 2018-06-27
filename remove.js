const debug = require('debug')('ara-filesystem:remove')
const { create } = require('./create')
const pify = require('pify')

async function remove({
  paths = [],
  did = ''
} = {}) {
  const afs = await create({ did })
  for (const path of paths) {
    await pify(afs.rimraf)(path)
  }
  await afs.close()
}

module.exports = {
  remove
}
