const { web3 } = require('ara-context')()

module.exports = {

  kPassword: 'pass',

  kPrefix: 'did:ara:',

  kRandomEthAddress: '0xef61059258414a65bf2d94a4fd3b503b5fee8b48',

  getDID({ context }) {
    return context.did.did
  },

  getAccount({ context }) {
    return context.account
  },

  async supplyAccount(address, accounts, transferAmount) {
    let balance = 0
    let i = 0
    while (balance < 1) {
      if (!accounts[i]) {
        break
      }
      // eslint-disable-next-line no-await-in-loop
      balance = await web3.eth.getBalance(accounts[i])
      balance = Number(web3.utils.fromWei(balance, 'ether'))
      i++
    }

    if (accounts[i]) {
      await web3.eth.sendTransaction({ from: accounts[i], to: address, value: transferAmount })
    }
  }

}
