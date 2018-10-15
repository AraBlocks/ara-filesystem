const { error } = require('ara-console')
const inquirer = require('inquirer')

/**
 * For functions that all subcommands share.
 */

async function promptForPassword(message) {
  message = message || "Please provide the passphrase for your identity. This is needed to " +
    "complete this action.\n" +
    "Passphrase:"
  return await inquirer.prompt([{
    type: 'password',
    name: 'password',
    message
  }])
}

function onfatal(err) {
  if (err) {
    error('fatal: %s', err.message)
  }
  process.exit(1)
}

async function promptCostConfirmation(cost) {
  return await inquirer.prompt({
    type: 'confirm',
    name: 'answer',
    message: 
    `This operation will cost ${cost} ETH. Are you sure you
    want to proceed?`
  })
}

async function promptForMnemonic() {
  return await inquirer.prompt([{
    name: 'mnemonic',
    message: "Please provide the mnemonic associated with your AFS identity."
  }])
}

module.exports = {
  promptCostConfirmation,
  promptForMnemonic,
  promptForPassword,
  onfatal
}
