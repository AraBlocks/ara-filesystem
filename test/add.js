/* eslint-disable no-await-in-loop */

const isDirectory = require('is-directory')
const { create } = require('../create')
const mirror = require('mirror-folder')
const crypto = require('ara-crypto')
const aid = require('ara-identity')
const { add } = require('../add')
const mkdirp = require('mkdirp')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  kTestOwnerDidNoMethod,
  kPassword: password
} = require('./_constants')

const {
  resolve,
  join,
  parse
} = require('path')

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  const publicKey = Buffer.from(kTestOwnerDidNoMethod, 'hex')
  const hash = crypto.blake2b(publicKey).toString('hex')
  const path = `${__dirname}/fixtures/identities`
  const ddoPath = resolve(path, hash, 'ddo.json')
  const ddo = JSON.parse(await pify(fs.readFile)(ddoPath, 'utf8'))
  const identityPath = aid.createIdentityKeyPath(ddo)
  const parsed = parse(identityPath)
  await pify(mkdirp)(parsed.dir)
  await pify(mirror)(resolve(path, hash), identityPath)
  t.context = { ddo, did: kTestOwnerDidNoMethod }
})

test.beforeEach(async (t) => {
  const { did, ddo } = t.context
  let afs
  try {
    // eslint-disable-next-line semi
    ({ afs } = await create({ owner: did, password, ddo }));
  } catch (err) {
    console.log(err)
  }
  t.context = { afs }
})

test('add() valid did, valid password, no paths', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  await t.throwsAsync(add({
    did,
    password
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test('add() valid did, valid password, valid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './index.js' ]

  await add({
    did,
    paths,
    password
  })

  const buf = await afs.readFile(paths[0])
  t.is(Buffer.compare(buf, fs.readFileSync(paths[0])), 0)
})

test('add() valid did, valid password, valid path (3)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './index.js', './add.js', './aid.js' ]

  await add({
    did,
    paths,
    password
  })

  let buf
  for (const path of paths) {
    buf = await afs.readFile(path)
    t.is(Buffer.compare(buf, fs.readFileSync(path)), 0)
  }
})

test('add() valid did, valid password, valid directory (1, not nested)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './bin' ]

  await add({
    did,
    paths,
    password
  })
  t.true(await directoriesAreEqual(afs, paths[0]))
})

test('add() valid did, valid password, valid directory (1, nested)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './test' ]

  await add({
    did,
    paths,
    password
  })
  t.true(await directoriesAreEqual(afs, paths[0]))
})

test('add() valid did, valid password, valid directory (2, nested)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './test', './lib' ]

  await add({
    did,
    paths,
    password
  })

  t.true(await directoriesAreEqual(afs, paths[0]))
  t.true(await directoriesAreEqual(afs, paths[1]))
})

test('add() valid did, valid password, invalid directory (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './doesnotexist' ]

  await add({
    did,
    paths,
    password
  })

  await t.throwsAsync(afs.readdir(paths[0]), Error, '')
})

test('add() valid did, valid password, invalid directory (1), valid directory (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './doesnotexist', './bin' ]

  await add({
    did,
    paths,
    password
  })

  await t.throwsAsync(afs.readdir(paths[0]), Error, '')
  t.true(await directoriesAreEqual(afs, paths[1]))
})

test('add() valid did, valid password, invalid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './doesnotexist.js' ]

  await add({
    did,
    paths,
    password
  })

  await t.throwsAsync(afs.readFile(paths[0]), Error, '')
})

test('add() valid did, valid password, invalid path (1), valid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './doesnotexist.js', './index.js' ]

  await add({
    did,
    paths,
    password
  })

  await t.throwsAsync(afs.readFile(paths[0]), Error, '')
  const buf = await afs.readFile(paths[1])
  t.is(Buffer.compare(buf, fs.readFileSync(paths[1])), 0)
})

test('add() valid did, invalid password, no paths', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  await t.throwsAsync(add({
    did,
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test('add() valid did, invalid password, valid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './index.js' ]

  await t.throwsAsync(add({
    did,
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: incorrect password')
})

test('add() valid did, invalid password, valid path (2)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  const paths = [ './index.js', './add.js' ]

  await t.throwsAsync(add({
    did,
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: incorrect password')
})

test('add() invalid did, valid password, no paths', async (t) => {
  await t.throwsAsync(add({
    did: 'invaliddid',
    password
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, valid password, valid path (1)', async (t) => {
  const paths = [ './index.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, valid password, valid path (1), invalid path (1)', async (t) => {
  const paths = [ './index.js', './doesnotexist.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, invalid password, no paths', async (t) => {
  await t.throwsAsync(add({
    did: 'invaliddid',
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test('add() invalid did, invalid password, valid path (1)', async (t) => {
  const paths = [ './index.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, invalid password, valid path (1), invalid path(1)', async (t) => {
  const paths = [ './index.js', './doesnotexist.js' ]

  await t.throwsAsync(add({
    did: 'invaliddid',
    paths,
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
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
