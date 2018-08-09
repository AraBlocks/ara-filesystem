const debug = require('debug')('ara-filesystem:unarchive')
const mirror = require('mirror-folder')
const { create } = require('./create')

const {
  resolve,
  isAbsolute
} = require('path')

async function unarchive({
  did = '',
  path = ''
} = {}) {
  if (!did || 'string' !== typeof did) {
    throw new TypeError('DID URI must be of type string.')
  } else if (path && 'string' !== typeof path) {
    throw new TypeError('Path must be of type string.')
  }

  const { afs } = await create({ did })

  try {
    const result = await afs.readdir(afs.HOME)
    if (0 === result.length) {
      throw new Error('Can only unarchive a non-empty AFS.')
    }
  } catch (err) {
    throw err
  }

  path = path || __dirname
  if (!isAbsolute(path)) {
    path = resolve(path)
  }

  const progress = mirror({
    name: afs.HOME,
    fs: afs
  }, { name: path }, { keepExisting: true }, onerror)

  progress.on('put', onput)
  progress.on('skip', onskip)
  progress.on('end', onend)

  function onerror(err) {
    debug('unarchive error', err)
  }

  function onput(src) {
    debug('onput', src.name)
  }

  function onskip(src) {
    debug('onskip', src.name)
  }

  function onend() {
    debug('unarchive complete')
    afs.close()
  }
}

module.exports = {
  unarchive
}
