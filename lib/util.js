const { error } = require('ara-console')
const inquirer = require('inquirer')

/**
 * For functions that all subcommands share.
 */

async function promptForPassword(message) {
  message = message || 'Please provide the passphrase for your identity. This is needed to ' +
    'complete this action.\n' +
    'Passphrase:'
  return inquirer.prompt([ {
    type: 'password',
    name: 'password',
    message
  } ])
}

function onfatal(err) {
  if (err) {
    error('fatal: %s', err.message)
  }
  process.exit(1)
}

async function promptCostConfirmation(cost) {
  return inquirer.prompt({
    type: 'confirm',
    name: 'answer',
    message:
    `This operation will cost ${cost} ETH. Are you sure you
    want to proceed?`
  })
}

async function promptForMnemonic() {
  return inquirer.prompt([ {
    name: 'mnemonic',
    message: 'Please provide the mnemonic associated with your AFS identity.'
  } ])
}

async function displayConfirmationPrompt({
  name = 'answer',
  message = 'Are you sure you want to continue?'
} = {}) {
  return inquirer.prompt([ {
    name,
    type: 'confirm',
    message
  } ])
}

module.exports = {
  displayConfirmationPrompt,
  promptCostConfirmation,
  promptForMnemonic,
  promptForPassword,
  onfatal
}
