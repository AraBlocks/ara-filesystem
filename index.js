const { create } = require('./create')
const { read, write, unlink } = require('./storage')

void async function main() {
  await write('did:ara:b96e9e1a5867d95529cd5fd634d416cdd49eba6c4782272a701ea7f90ea22109')
}()

module.exports = {
  create,
  write,
  read,
  unlink
}
