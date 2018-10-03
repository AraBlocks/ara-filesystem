const rc = require('ara-runtime-configuration')
const { resolve } = require('path')
const extend = require('extend')
const os = require('os')

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
      keyring: resolve(os.homedir(), '.ara', 'keyrings', 'keyring'),
      archive: 'lara.archiver',
      resolver: 'lara.resolver',
    }
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
