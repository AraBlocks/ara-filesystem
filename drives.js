'use strict'

const { createAFSKeyPath } = require('./key-path')
const { info } = require('ara-console')
const debug = require('debug')('ara-filesystem:drive:map')

Object.assign(exports, new class {
  has(value) {
    value = value || {}
    const { id, afs } = value
    if (afs && afs.identifier) {
      const path = createAFSKeyPath({id: afs.identifier})
      return path in this
    } else if (id) {
      const path = createAFSKeyPath(id)
      return path in this
    } else {
      return false
    }
  }
})
