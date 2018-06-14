'use strict'

const { create } = require('./create')

// TODO(cckelly): remove once functional
void async function main() {
  await create('9a20b1d84fd7671a2fa480d73acdade124f2c16b4f9934875cb7d6c78ff91bf0')
}()

module.exports = {
  create
}
