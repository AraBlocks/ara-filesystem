/* eslint-disable no-await-in-loop */

const isDirectory = require('is-directory')
const { create } = require('../create')
const { remove } = require('../remove')
const mirror = require('mirror-folder')
const crypto = require('ara-crypto')
const aid = require('ara-identity')
const { add } = require('../add')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const pify = require('pify')
const test = require('ava')
const fs = require('fs')

const {
  TEST_OWNER_DID_NO_METHOD,
  PASSWORD: password
} = require('./_constants')

const {
  resolve,
  parse,
  join
} = require('path')

const getAFS = (t) => {
  const { afs } = t.context
  return afs
}

test.before(async (t) => {
  const publicKey = Buffer.from(TEST_OWNER_DID_NO_METHOD, 'hex')
  const hash = crypto.blake2b(publicKey).toString('hex')
  const path = `${__dirname}/fixtures/identities`
  const ddoPath = resolve(path, hash, 'ddo.json')
  const ddo = JSON.parse(await pify(fs.readFile)(ddoPath, 'utf8'))
  const identityPath = aid.createIdentityKeyPath(ddo)
  const parsed = parse(identityPath)
  await pify(mkdirp)(parsed.dir)
  await pify(mirror)(resolve(path, hash), identityPath)
  t.context = { ddo, did: TEST_OWNER_DID_NO_METHOD }
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
  t.context = { afs, idPath: aid.createIdentityKeyPath(afs.ddo) }
})

test.afterEach(async (t) => {
  const { idPath } = t.context
  if (idPath) {
    await pify(rimraf)(idPath)
  }
})

test('remove() valid did, valid password, no paths', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  await t.throwsAsync(remove({
    did,
    password
  }), TypeError, 'ara-filesystem.remove: Expecting one or more filepaths to remove')
})

test.serial('remove() valid did, valid password, valid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './index.js' ]

  await add({
    did,
    paths,
    password
  })

  await remove({
    did,
    paths,
    password
  })

  await t.throwsAsync(afs.access(paths[0]), Error, '')
})

test('remove() valid did, valid password, valid path (3)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './index.js', './add.js', './aid.js' ]

  await add({
    did,
    paths,
    password
  })

  await remove({
    did,
    paths,
    password
  })

  for (const path of paths) {
    await t.throwsAsync(afs.access(path), Error, '')
  }
})

test('remove() valid did, valid password, valid directory (1, not nested)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './bin' ]

  await add({
    did,
    paths,
    password
  })

  await remove({
    did,
    paths,
    password
  })

  t.true(await allFilesUnlinked(afs, paths[0]))
})

test('remove() valid did, valid password, valid directory (1, nested)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './test' ]

  await add({
    did,
    paths,
    password
  })

  await remove({
    did,
    paths,
    password
  })

  t.true(await allFilesUnlinked(afs, paths[0]))
})

test('remove() valid did, valid password, valid directory (2, nested)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './test', './build' ]

  await add({
    did,
    paths,
    password
  })

  await remove({
    did,
    paths,
    password
  })

  t.true(await allFilesUnlinked(afs, paths[0]))
  t.true(await allFilesUnlinked(afs, paths[1]))
})

test('remove() valid did, valid password, invalid directory (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './doesnotexist' ]

  await t.notThrowsAsync(remove({
    did,
    paths,
    password
  }))
})

test('remove() valid did, valid password, invalid directory (1), valid directory (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './doesnotexist', './bin' ]

  await add({
    did,
    paths,
    password
  })

  await t.notThrowsAsync(remove({
    did,
    paths,
    password
  }))

  t.true(await allFilesUnlinked(afs, paths[1]))
})

test('remove() valid did, valid password, invalid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './doesnotexist.js' ]

  await t.notThrowsAsync(remove({
    did,
    paths,
    password
  }))

  await t.throwsAsync(afs.access(paths[0]), Error, '')
})

test('remove() valid did, valid password, invalid path (1), valid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './doesnotexist.js', './index.js' ]

  await add({
    did,
    paths,
    password
  })

  await t.notThrowsAsync(remove({
    did,
    paths,
    password
  }))

  for (const path of paths) {
    await t.throwsAsync(afs.access(path), Error, '')
  }
})

test('remove() valid did, invalid password, no paths', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  await t.throwsAsync(remove({
    did,
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.remove: Expecting one or more filepaths to remove')
})

test('remove() valid did, invalid password, valid path (1)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './index.js' ]

  await t.throwsAsync(remove({
    did,
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: incorrect password')
})

test('remove() valid did, invalid password, valid path (2)', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  const paths = [ './index.js', './add.js' ]

  await t.throwsAsync(remove({
    did,
    paths,
    password: 'wrongpass'
  }), Error, 'ara-filesystem.create: incorrect password')
})

test('remove() invalid did, valid password, no paths', async (t) => {
  await t.throwsAsync(remove({
    did: 'invaliddid',
    password
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('remove() invalid did, valid password, valid path (1)', async (t) => {
  const paths = [ './index.js' ]

  await t.throwsAsync(remove({
    did: 'invaliddid',
    paths,
    password
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('remove() invalid did, invalid password, no paths', async (t) => {
  await t.throwsAsync(remove({
    did: 'invaliddid',
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.remove: Expecting one or more filepaths to remove')
})

test('remove() invalid did, invalid password, valid path (1)', async (t) => {
  const paths = [ './index.js' ]

  await t.throwsAsync(remove({
    did: 'invaliddid',
    paths,
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('remove() invalid did, invalid password, valid path (1), invalid path(1)', async (t) => {
  const paths = [ './index.js', './doesnotexist.js' ]

  await t.throwsAsync(remove({
    did: 'invaliddid',
    paths,
    password: 'wrongpass'
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('remove() invalid did, valid password, valid path (1), invalid path (1)', async (t) => {
  const paths = [ './index.js', './doesnotexist.js' ]

  await t.throwsAsync(remove({
    did: 'invaliddid',
    paths,
    password
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

async function allFilesUnlinked(afs, path) {
  try {
    await afs.access(path)
    return false
  } catch (err) {
    const src = resolve(path)
    if (await pify(isDirectory)(src)) {
      const fsFiles = fs.readdirSync(path)

      for (let i = 0; i < fsFiles.length; i++) {
        const fsFilePath = join(src, fsFiles[i])
        let afsFilePath = fsFilePath.replace(process.cwd(), afs.HOME)

        if (await pify(isDirectory)(fsFilePath)) {
          afsFilePath = afsFilePath.replace(afs.HOME, '.')
        }
        if (!(await allFilesUnlinked(afs, afsFilePath))) {
          return false
        }
      }
    }
    return true
  }
}
