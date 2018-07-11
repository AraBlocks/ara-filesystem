/* eslint no-undef: "off" */

const Storage = artifacts.require('./Storage.sol')
const Price = artifacts.require('./Price.sol')

module.exports = (deployer) => {
  deployer.deploy(Storage)
  deployer.deploy(Price)
}
