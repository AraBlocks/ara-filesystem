const extend = require('extend')
const rc = require('ara-runtime-configuration')
const os = require('os')
const { resolve } = require('path')

const kAraDir = '.ara'
const kAfsDir = 'afs'
const kIdentitiesDir = 'identities'

const defaults = () => ({
  afs: {
    archive: {
      root: resolve(os.homedir(), kAraDir, kAfsDir),
      store: resolve(os.homedir(), kAraDir, kAfsDir, 'nodes')
    }
  },
  araId: {
    archive: {
      root: resolve(os.homedir(), kAraDir, kIdentitiesDir)
    },
  },
  network: {
    identity: {
      root: resolve(os.homedir(), kAraDir, kIdentitiesDir)
      archiver: 'ara-archiver'
      resolver: 'ara-resolver'
    }
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
