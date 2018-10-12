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

module.exports = {
  promptForPassword,
  onfatal
}
