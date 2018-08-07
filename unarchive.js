const debug = require('debug')('ara-filesystem:unarchive')
const { create } = require('./create')
const unixify = require('unixify')
const mirror = require('mirror-folder')
const { validate } = require('ara-util')

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
  path = path || __dirname

  const progress = mirror({
    name: '/home',
    fs: afs
  }, { name: path }, {}, onerror)

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
