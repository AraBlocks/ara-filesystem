const rc = require('ara-runtime-configuration')
const { resolve } = require('path')
const extend = require('extend')
const os = require('os')

const kAraDir = '.ara'
const kAfsDir = 'afs'
const kIdentitiesDir = 'identities'
const kSecretsDir = 'keyrings'

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
  secret: {
    archiver: resolve(os.homedir(), kAraDir, kSecretsDir, 'ara-archiver.pub'),
    resolver: resolve(os.homedir(), kAraDir, kSecretsDir, 'ara-resolver.pub')
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
