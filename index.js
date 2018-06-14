'use strict'

const { create } = require('./create')

// TODO remove me
void async function main() {
  await create()
}()

module.exports = {
  create
}
