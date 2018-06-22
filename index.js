const { create } = require('./create')
const { read, write, unlink } = require('./storage')

module.exports = {
  create,
  write,
  read,
  unlink
}
