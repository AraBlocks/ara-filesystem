/* eslint no-undef: "off" */

const Storage = artifacts.require('./Storage.sol')

module.exports = (deployer) => {
  deployer.deploy(Storage)
}
