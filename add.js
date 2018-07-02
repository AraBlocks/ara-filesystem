const debug = require('debug')('ara-filesystem:add')
const { create } = require('./create')
const { resolve } = require('path')
const fs = require('fs')
const aid = require('./aid')
const { stat, access } = require('fs')
const pify = require('pify')
const isDirectory = require('is-directory')
const isFile = require('is-file')
const cliWidth = require('cli-width')
const differ = require('ansi-diff-stream')
const ProgressStream = require('progress-stream')
const ProgressBar = require('progress')
const bytes = require('pretty-bytes')
const { loadSecrets, afsOwner, generateKeypair, validateDid } = require('./util')
const { create: createDid } = require('ara-identity/did')

const ignored = require('./lib/ignore')

const { kResolverKey } = require('./constants')

const toLower = (x) => String(x).toLowerCase()

async function add({
  did,
  paths,
  password,
  watch,
  force
}) {
  if (null == did || 'string' !== typeof did || !did) {
    throw new TypeError('ara-filesystem.add: Expecting non-empty did.')
  }

  if (null == password || 'string' !== typeof password || !password) {
    throw new TypeError('ara-filesystem.add: Password required to continue')
  }

  if (null === paths || !(paths instanceof Array)) {
    throw new TypeError('ara-filesystem.add: Expecting one or more filepaths to add')
  }

  const { afs } = await create({ did, password })

  // ensure paths exists
  for (const path of paths) {

    // ensure local file path exists
    try { await pify(access)(path) }
    catch (err) { debug("%s does not exist", path) }

    // directories
    if (await pify(isDirectory)(path)) {
      // add local directory to AFS at path
      try {
        debug("Adding directory %s", path)
        await addDirectory(path)
        continue
      } catch (err) {
        debug("mirror: ", err.stack)
        debug("E: Failed to add path %s", path)
      }
    }

    // files
    if (await pify(isFile)(path)) {
      try {
        debug("Adding file %s", path)
        await addFile(path)
        continue
      } catch (err) {
        debug("addFile:", err.stack)
        debug("E: Failed to add path %s", path)
      }
    }
  }

  async function addDirectory(path) {
    const src = resolve(path)
    const dest = src.replace(process.cwd(), afs.HOME)

    debug("mirror: %s <> %s", src, dest)

    // file stats
    const stats = {size: 0}

    // accumate deltas
    await pify((done) => {
      mirror({name: src}, {name: dest, fs: afs}, {ignore, dryRun: true})
        .on('debug', done)
        .on('end', done)
        .on('put', ({stat}) => {
          stats.size += stat.size
        })
    })()

    const progress = createProgressStreams({stats})

    if (!watch || (stats && stats.size)) {
      await pify((done) => {
        mirror({name: src}, {name: dest, fs: afs}, {ignore, watch: watch})
          .on('debug', done)
          .on('end', done)
          .on('put', onput)
          .on('put-data', ondata)
      })()
    }

    function onput({stat}) {
      if (stat && stat.size) {
        progress.updateWriter(stat.size)
      }
    }

    function ondata(chunk) {
      if (chunk && chunk.length) {
        progress.updateReader(chunk.length)
      }
    }

    function ignore(filename) {
      if (force) {
        return false
      } else {
        debug("ignore: %s", filename)
        return ignored.ignores(filename)
      }
    }
  }

  async function addFile(path) {
    if (!force && ignored.ignores(path)) {
      throw new debug(`ignore: ${path} is ignored. Use '--force' to force add file.`)
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
          warn("Force adding %s", path)
        } else {
          return
        }
      }
    } catch (err) {
      // file does not exist in AFS, it will be created later
    }

    // IO stream
    const reader = fs.createReadStream(src, {autoClose: true})
    const writer = afs.createWriteStream(dest)

    // used for spliting buffer chunks
    const { highWaterMark } = writer._writableState

    reader.setMaxListeners(0)
    writer.setMaxListeners(0)

    return createPipe({reader, writer, stats})
  }

  async function createPipe({reader, writer, stats}) {
    if (!stats || 0 == stats.size) {
      process.nextTick(() => warn("Wrote 0 bytes"))
      return writer.end()
    }

    const progress = createProgressStreams({stats})

    // work
    await new Promise((resolve, reject) => {
      let didReadStreamEnd = false

      writer.on('finish', onfinish)
      writer.on('debug', ondebug)

      reader.on('debug', ondebug)
      reader.on('data', ondata)
      reader.on('end', onend)

      reader.pipe(writer)

      function ondata(chunk) {
        debug("Read stream received buffer of size %s", chunk.length)
        debug("Writing chunk %s", chunk.length)
        progress.updateReader(chunk.length)
        process.nextTick(() => {
          progress.updateWriter(chunk.length)
        })
      }

      function onfinish() {
        debug("Write stream finished")
        process.nextTick(resolve)
      }

      function onend() {
        debug("Read stream ended")
        didReadStreamEnd = true
      }

      function ondebug(err) {
        reject(err)
      }
    })
  }

  function createProgressStreams({stats}) {
    const start = Date.now()
    const current = {reader: 0, writer: 0}

    const progressBarSpec = {
      complete: '-',
      incomplete: ' ',
      width: Math.floor(0.78*((cliWidth() || 30) - 50)),
      total: stats.size,
      stream: differ().pipe(process.stderr)
    }

    const readerProgressBarTemplate = createProgressBarTemplate('Reading')
    const writerProgressBarTemplate = createProgressBarTemplate('Writing')

    const readerProgressStream = createProgressStream()
    const writerProgressStream = createProgressStream()

    // progress bar renderers
    const readerProgressBar = createProgressBar(readerProgressBarTemplate)
    const writerProgressBar = createProgressBar(writerProgressBarTemplate)

    // progress stream info
    readerProgressStream.on('progress', (progress) => {
      debug("Reader progress %j", progress)
    })
    writerProgressStream.on('progress', (progress) => {
      debug("Writer progress %j", progress)
    })

    if (stats.size) {
      readerProgressBar.tick(0, {speed: toLower(bytes(0))})
      writerProgressBar.tick(0, {speed: toLower(bytes(0))})
    }

    return {
      updateReader(size) {
        current.reader += size
        const elapsed = Date.now() - start
        const speed = toLower(bytes(Math.floor(current.reader / (elapsed/1000 || 1))))
        readerProgressBar.tick(size, {speed})
        readerProgressStream.write(Buffer(size))
      },

      updateWriter(size) {
        current.writer += size
        const elapsed = Date.now() - start
        const speed = toLower(bytes(Math.floor(current.writer / (elapsed/1000 || 1))))
        writerProgressBar.tick(size, {speed})
        writerProgressStream.write(Buffer(size))
      }
    }

    // progress stuff
    function createProgressBarTemplate(name) {
      return `afs: info: ${name} [:bar] :speedps :percent :etas`.trim()
    }

    function createProgressStream() {
      return new ProgressStream({length: stats.size, time: 100})
    }

    function createProgressBar(template) {
      return new ProgressBar(template, progressBarSpec)
    }
  }
}

module.exports = {
  add
}
