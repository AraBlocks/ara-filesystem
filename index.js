const { create } = require('./create')
const { read, write, unlink } = require('./storage')

void async function main() {
  //await write('97b3f6f99d0cbc68ed5b1620e81885f89458c78cddfcf14487c032e7db5edf10')
}()

module.exports = {
  create,
  write,
  read,
  unlink
}
