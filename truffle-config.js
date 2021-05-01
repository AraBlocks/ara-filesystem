const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')

module.exports = {
  networks: {
    local: {
      provider: () => new Web3.providers.WebsocketProvider('ws://localhost:8545'),
      network_id: '*',
      host: 'localhost',
      port: 8545,
      websockets: true
      // gas: 4000000
    },
    testnet: {
      provider: () => new HDWalletProvider(process.env.TESTNET_MNEMONIC, `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`),
      network_id: 3,
      gas: 4000000
    },
    privatenet: {
      provider: () => new Web3.providers.WebsocketProvider('ws://localhost:8545'),
      network_id: 1337,
      host: 'localhost',
      port: 8545,
      from: '0xa0b3a0ca8523e036a116184c5c07ca932e611d06',
      gas: 8000000,
      websockets: true
    },
    kovan: {
      provider: () => new HDWalletProvider(process.env.TESTNET_MNEMONIC, `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`),
      network_id: 42,
      from: '0xEDF03c12b1b1cd1461B5231103f7002984C245AE',
      gas: 4000000
    }
  }
}
