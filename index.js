'use strict'

const { create } = require('./create')

// TODO(cckelly): remove once functional
void async function main() {
  await create('2b2cf2b6a46e13a5af9aae714d3755b64cf0f0f9e12e5123c2944bd9d316d397')
}()

module.exports = {
  create
}
