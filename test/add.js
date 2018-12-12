/* eslint-disable no-await-in-loop */

const { PASSWORD: password } = require('./_constants')
const { add, create } = require('../')
const isDirectory = require('is-directory')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  mirrorIdentity,
  createAFS,
  cleanup
} = require('./_util')

const {
  resolve,
  join
} = require('path')

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  t.context = await mirrorIdentity()
})

test.beforeEach(async (t) => {
  t.context = await createAFS(t)
})

test.afterEach(async (t) => {
  await cleanup(t)
})

test.serial('add() valid did, valid password, no paths', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  await t.throwsAsync(add({
    did,
    password
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test.serial('add() valid did, valid password, valid path (1)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './index.js' ]

  await add({
    did,
    paths,
    password
  })

  const { afs } = await create({ did })
  const buf = await afs.readFile(paths[0])
  t.is(Buffer.compare(buf, fs.readFileSync(paths[0])), 0)
})

test.serial('add() valid did, valid password, valid path (3)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './index.js', './add.js', './commit.js' ]

  await add({
    did,
    paths,
    password
  })

  const { afs } = await create({ did })
  let buf
  for (const path of paths) {
    buf = await afs.readFile(path)
    t.is(Buffer.compare(buf, fs.readFileSync(path)), 0)
  }
})

test.serial('add() valid did, valid password, valid directory (1, not nested)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './bin' ]

  await add({
    did,
    paths,
    password
  })
  const { afs } = await create({ did })
  t.true(await directoriesAreEqual(afs, paths[0]))
})

test.serial('add() valid did, valid password, valid directory (1, nested)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './test' ]

  await add({
    did,
    paths,
    password
  })
  const { afs } = await create({ did })
  t.true(await directoriesAreEqual(afs, paths[0]))
})

test.serial('add() valid did, valid password, valid directory (2, nested)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './test', './lib' ]

  await add({
    did,
    paths,
    password
  })

  const { afs } = await create({ did })
  t.true(await directoriesAreEqual(afs, paths[0]))
  t.true(await directoriesAreEqual(afs, paths[1]))
})

test.serial('add() valid did, valid password, invalid directory (1)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './doesnotexist' ]

  await add({
    did,
    paths,
    password
  })

  const { afs } = await create({ did })
  await t.throwsAsync(afs.readdir(paths[0]), Error, '')
})

test.serial('add() valid did, valid password, invalid directory (1), valid directory (1)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './doesnotexist', './bin' ]

  await add({
    did,
    paths,
    password
  })

  const { afs } = await create({ did })
  await t.throwsAsync(afs.readdir(paths[0]), Error, '')
  t.true(await directoriesAreEqual(afs, paths[1]))
})

test.serial('add() valid did, valid password, invalid path (1)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './doesnotexist.js' ]

  await add({
    did,
    paths,
    password
  })

  const { afs } = await create({ did })
  await t.throwsAsync(afs.readFile(paths[0]), Error, '')
})

test.serial('add() valid did, valid password, invalid path (1), valid path (1)', async (t) => {
  const { did } = getAFS(t)
  const paths = [ './doesnotexist.js', './index.js' ]

  await add({
    did,
    paths,
    password
  })

  const { afs } = await create({ did })

  await t.throwsAsync(afs.readFile(paths[0]), Error, '')
  const buf = await afs.readFile(paths[1])
  t.is(Buffer.compare(buf, fs.readFileSync(paths[1])), 0)
})

test.serial('add() valid did, invalid password, no paths', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  await t.throwsAsync(add({
    did,
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test.serial('add() valid did, invalid password, valid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './index.js' ]

  await t.throwsAsync(add({
    did,
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: incorrect password')
})

test.serial('add() valid did, invalid password, valid path (2)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './index.js', './add.js' ]

  await t.throwsAsync(add({
    did,
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: incorrect password')
})

test.serial('add() invalid did, valid password, no paths', async (t) => {
  await t.throwsAsync(add({
    did: 'invaliddid',
    password
  }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('add() invalid did, valid password, valid path (1)', async (t) => {
  const paths = [ './index.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password
  }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('add() invalid did, valid password, valid path (1), invalid path (1)', async (t) => {
  const paths = [ './index.js', './doesnotexist.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password
  }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('add() invalid did, invalid password, no paths', async (t) => {
  await t.throwsAsync(add({
    did: 'invaliddid',
    password: 'wrongpass'
  }), Error, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test.serial('add() invalid did, invalid password, valid path (1)', async (t) => {
  const paths = [ './index.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('add() invalid did, invalid password, valid path (1), invalid path(1)', async (t) => {
  const paths = [ './index.js', './doesnotexist.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: Unable to resolve AFS DID')
})

async function directoriesAreEqual(afs, path) {
  const src = resolve(path)
  const fsFiles = fs.readdirSync(path)
  const afsFiles = await afs.readdir(path)

  if ('object' !== typeof fsFiles || 'object' !== typeof afsFiles) return false

  if (fsFiles.length !== afsFiles.length) return false

  for (let i = 0; i < fsFiles.length; i++) {
    if (fsFiles[i] !== afsFiles[i]) return false

    const fsFilePath = join(src, fsFiles[i])
    const afsFilePath = fsFilePath.replace(process.cwd(), afs.HOME)

    if (await pify(isDirectory)(fsFilePath)) {
      const nestedPath = afsFilePath.replace(afs.HOME, '.')
      if (!(await directoriesAreEqual(afs, nestedPath))) {
        return false
      }
    }
  }

  return true
}
