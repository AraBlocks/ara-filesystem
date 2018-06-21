const { readFileSync, accessSync } = require('fs')
const { resolve } = require('path')
const debug = require('debug')('ara-filesystem:ignore')
const ignore = require('ignore')()

const kAFSIgnoreFile = '.afsignore'

try {
  const file = resolve(kAFSIgnoreFile)
  accessSync(file)
  for (const pattern of readFileSync(file, 'utf8').split('\n')) {
    debug('add:', pattern)
    ignore.add(pattern)
  }
} catch (err) {
  debug('error:', err.message)
}

ignore.add('.afs/')

module.exports = ignore
