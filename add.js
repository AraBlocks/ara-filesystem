/* eslint-disable no-await-in-loop */

const debug = require('debug')('ara-filesystem:add')
const { create } = require('./create')
const { resolve, join } = require('path')
const fs = require('fs')
const { stat, access } = require('fs')
const pify = require('pify')
const isDirectory = require('is-directory')
const isFile = require('is-file')

const ignored = require('./lib/ignore')

async function add({
  did = '',
  paths = [],
  password = '',
  force,
  rootPath,
} = {}) {
  if (null === did || 'string' !== typeof did || !did) {
    throw new TypeError('ara-filesystem.add: Expecting non-empty did.')
  }

  if (null === password || 'string' !== typeof password || !password) {
    throw new TypeError('ara-filesystem.add: Password required to continue')
  }

  if (null === paths || (!(paths instanceof Array) && 'string' !== typeof paths) || paths.length === 0) {
    throw new TypeError('ara-filesystem.add: Expecting one or more filepaths to add')
  }

  let afs
  try {
    ({ afs } = await create({ rootPath, did, password }))
  } catch (err) {
    throw err
  }

  await addAll(paths)

  async function addAll(files) {
    // ensure paths exists
    for (const path of files) {
      // ensure local file path exists
      try {
        await pify(access)(path)
        // directories
        if (await pify(isDirectory)(path)) {
          // add local directory to AFS at path
          try {
            debug('Adding directory %s', path)
            await createDirectory(path)
          } catch (err) {
            debug('createDirectory: ', err.stack)
            debug('E: Failed to add path %s', path)
          }
        }

        // files
        if (await pify(isFile)(path)) {
          try {
            debug('Adding file %s', path)
            await addFile(path)
          } catch (err) {
            debug('addFile:', err.stack)
            debug('E: Failed to add path %s', path)
          }
        }
      } catch (err) {
        debug('%s does not exist', path)
      }
    }
  }

  async function createDirectory(path) {
    const src = resolve(path)
    const dest = src.replace(process.cwd(), afs.HOME)
    await afs.mkdirp(dest)

    const files = await fs.readdirSync(path)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      files[i] = join(src, file)
    }
    await addAll(files)
  }

  async function addFile(path) {
    if (!force && ignored.ignores(path)) {
      throw new Error(`ignore: ${path} is ignored. Use '--force' to force add file.`)
    }
    // paths
    const src = resolve(path)
    const dest = src.replace(process.cwd(), afs.HOME)

    // file stats
    const stats = await pify(stat)(src)

    try {
      const { mtime } = await pify(afs.stat)(dest)
      if (stats.mtime <= mtime) {
        if (force) {
          debug('Force adding %s', path)
        } else {
          return
        }
      }
    } catch (err) {
      // file does not exist in AFS, it will be created later
    }

    // IO stream
    const reader = fs.createReadStream(src, { autoClose: true })
    const writer = afs.createWriteStream(dest)

    reader.setMaxListeners(0)
    writer.setMaxListeners(0)
    await createPipe({ reader, writer, stats })
    debug('Successfully added file', path)
  }

  async function createPipe({ reader, writer, stats }) {
    if (!stats || 0 === stats.size) {
      return writer.end()
    }

    // work
    // eslint-disable-next-line no-shadow
    const result = await new Promise((resolve, reject) => {
      writer.on('finish', onfinish)
      writer.on('debug', ondebug)

      reader.on('debug', ondebug)
      reader.on('data', ondata)
      reader.on('end', onend)

      reader.pipe(writer)

      function ondata(chunk) {
        debug('Read stream received buffer of size %s', chunk.length)
        debug('Writing chunk %s', chunk.length)
      }

      function onfinish() {
        debug('Write stream finished')
        process.nextTick(resolve)
      }

      function onend() {
        debug('Read stream ended')
      }

      function ondebug(err) {
        reject(err)
      }
    })
    return result
  }
}

module.exports = {
  add
}
