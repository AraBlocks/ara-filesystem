module.exports = {
  networks: {
    local: {
      network_id: 1,
      host: 'localhost',
      port: 9545
    },
    privatenet: {
      network_id: 1337,
      host: 'localhost',
      port: 8545
    }
  }
}
