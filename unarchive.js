const debug = require('debug')('ara-filesystem:unarchive')
const { create } = require('./create')
const unixify = require('unixify')
const mirror = require('mirror-folder')
const { validate } = require('ara-util')
const { isAbsolute, resolve } = require('path')

async function unarchive({
  did = '',
  password = '',
  path = ''
} = {}) {
  try {
    ({ did } = await validate({ did, password, label: 'commit' }))
  } catch (err) {
    throw err
  }

  if (path && 'string' !== typeof path) {
    throw new TypeError('Path must be of type string')
  }

  const { afs } = await create({ did, password })

  try {
    const result = await afs.readdir(afs.HOME)    
    if (0 === result.length) {
      throw new Error('Can only unarchive a non-empty AFS')
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
