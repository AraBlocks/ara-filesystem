const { create } = require('./create')
const { publish } = require('./publish')

void async function main() {
	await publish()
}()

module.exports = {
  create,
  publish
}
