const extend = require('extend')
const rc = require('ara-runtime-configuration')
const os = require('os')
const { resolve } = require('path')

const kAraDir = '.ara'
const kAfsDir = 'afs'

const defaults = () => ({
  afs: {
    archive: {
      root: resolve(os.homedir(), kAraDir, kAfsDir)
    }
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
