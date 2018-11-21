const rc = require('ara-runtime-configuration')
const { resolve } = require('path')
const extend = require('extend')

const AFS_DIR = 'afs'

const defaults = base => ({
  network: {
    afs: {
      archive: {
        root: resolve(base.data.root, AFS_DIR),
        store: resolve(base.data.root, AFS_DIR, 'nodes.json')
      }
    }
  }
})

module.exports = conf => rc(base => extend(true, defaults(base), conf))
