const { validate } = require('ara-util')

const {
  proxyExists,
  deployProxy
} = require('ara-contracts/registry')

/**
 * Deploys AFS proxy to the network.
 * @return {[type]} [description]
 */
async function deploy(opts) {
  if (!opts || 'object' !== typeof opts) {
    throw new TypeError('Expecting opts object.')
  } else if ('string' !== typeof opts.did || !opts.did) {
    throw new TypeError('Expecting non-empty string.')
  } else if ('string' !== typeof opts.password || !opts.password) {
    throw TypeError('Expecting non-empty password.')
  } else if (opts.estimate && 'boolean' !== typeof opts.estimate) {
    throw new TypeError('Expecting boolean.')
  }

  let { did, estimate } = opts
  const { password, keyringOpts } = opts

  estimate = estimate || false

  try {
    ({ did } = await validate({
      did, password, label: 'commit', keyringOpts
    }))
  } catch (err) {
    throw err
  }

  if (await proxyExists(did)) {
    throw new Error('Proxy already exists')
  }

  let result
  try {
    result = await deployProxy({
      contentDid: did,
      keyringOpts,
      password,
      estimate
    })
    if (estimate) {
      return result.toString()
    }
  } catch (err) {
    throw err
  }

  return result
}

module.exports = {
  deploy
}
