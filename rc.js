const extend = require('extend')
const rc = require('ara-runtime-configuration')
const os = require('os')
const { resolve } = require('path')

const defaults = () => ({
  afs: {
    archive: {
      root(id) {
        const { createCFSKeyPath } = require('cfsnet/key-path')
        const keyPath = createCFSKeyPath({ id }).split('/').pop()
        return resolve(os.homedir(), '.ara', 'afs', keyPath)
      }
    }
  }
})

module.exports = conf => rc(extend(true, {}, defaults(), conf))
