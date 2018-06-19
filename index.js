const { create } = require('./create')
const { publish } = require('./publish')

// TODO(cckelly): remove me
void async function main() {
	await publish({
		identity: '1234'
	})
}()

module.exports = {
  create,
  publish
}
