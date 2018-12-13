const { error } = require('ara-console')
const pkg = require('../package.json')
const { basename } = require('path')

/*
 * we use this hack to notify child processes that they were invoked
 * from the `afs(1)` shell command
 */
const FROM_AFS_PARENT_FLAG = 'from-afs-parent'

if (process.argv.join('').indexOf(FROM_AFS_PARENT_FLAG) > -1) {
  removeAFSParentFlagFromArgv(process.argv)
  process.title = `[afs/${basename(process.argv[1]).replace('afs-', '')}]`
} else {
  process.title = basename(process.argv[1])
}

// this MUST be required after the `process.argv` hax done above
// eslint-disable-next-line import/no-unresolved
const program = require('yargs')

/*
 * We can configure all programs this way
 * and allow the creation of a "new" one through
 * the `createProgram()` function
 */
const { argv } = program
  .help(false)
  .option('help', {
    describe: 'Show this message',
    alias: 'h',
  })
  .option('debug', {
    alias: 'D',
    describe: 'Enable debug output (Sets \'DEBUG=ara-filesystem:*\')'
  })
  .option('secret', {
    alias: 's',
    type: 'string',
    describe: 'Shared secret for the keyring'
  })
  .option('network', {
    alias: 'n',
    type: 'string',
    describe: 'Network name of the key for the DID resolver in the keyring'
  })
  .option('keyring', {
    alias: 'k',
    type: 'string',
    describe: 'Path to the keyring'
  })
  .version('V', pkg.version)
  .alias('V', [ 'version', 'v' ])

/**
 * Returns a pre configured yargsa program object
 * with defaults and usage.
 *
 * @public
 * @param {Object} opts
 * @param {String} opts.usage
 * @return {Object}
 */
function createProgram({ usage }) {
  return program
    .usage(String(usage).trim())
    .option(FROM_AFS_PARENT_FLAG, {
      hidden: true,
    })
}

function removeAFSParentFlagFromArgv(args) {
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i]
    if (arg.replace('--', '') == FROM_AFS_PARENT_FLAG) {
      args.splice(i, 1)
    }
  }
}

/*
 * handle unhandledRejection errors thrown from async
 * functions or promises
 */
process.on('unhandledRejection', (err) => {
  error('An unknown error occured: %s', err.message)
})

// handle uncaughtException errors thrown from anywhere
process.on('uncaughtException', (err) => {
  error('An unknown error occured: %s', err.message)
})

module.exports = {
  FROM_AFS_PARENT_FLAG,
  createProgram,
  argv
}
