/* eslint no-undef: "off" */

const Ownership = artifacts.require('./Ownership.sol')

module.exports = (deployer) => {
  deployer.deploy(Ownership)
}
