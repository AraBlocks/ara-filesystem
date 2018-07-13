const { add } = require('../add')
const { create } = require('../create')
const { remove } = require('../remove')
const test = require('ava')
const { 
  kTestOwnerDid, 
  kTestOwnerDidNoMethod, 
  kPassword } = require('./_constants')
const fs = require('fs')
const isDirectory = require('is-directory')
const isFile = require('is-file')
const pify = require('pify')
const { resolve, join } = require('path')

test.serial('remove() valid did, valid password, no paths', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  await t.throws(remove({ 
    did, 
    password: kPassword 
  }), TypeError, 'ara-filesystem.remove: Expecting one or more filepaths to remove')
})

test.serial('remove() valid did, valid password, valid path (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./index.js']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })

  await remove({
    did,
    paths,
    password: kPassword
  })

  await t.throws(afs.access(paths[0]), Error, '')
})

test.serial('remove() valid did, valid password, valid path (3)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./index.js', './add.js', './aid.js']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })

  await remove({
    did,
    paths,
    password: kPassword
  })

  for (const path of paths) {
    await t.throws(afs.access(path), Error, '')
  }
})

test.serial('remove() valid did, valid password, valid directory (1, not nested)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./bin']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })

  await remove({
    did,
    paths,
    password: kPassword
  })
  
  t.true(await allFilesUnlinked(afs, paths[0]))
})

test.serial('remove() valid did, valid password, valid directory (1, nested)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./test']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })
  
  await remove({
    did,
    paths,
    password: kPassword
  })
  
  t.true(await allFilesUnlinked(afs, paths[0]))
})

test.serial('remove() valid did, valid password, valid directory (2, nested)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./test', './build']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })

  await remove({
    did,
    paths,
    password: kPassword
  })
  
  t.true(await allFilesUnlinked(afs, paths[0]))
  t.true(await allFilesUnlinked(afs, paths[1]))
})

test.serial('remove() valid did, valid password, invalid directory (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./doesnotexist']

  await t.notThrows(remove({
    did,
    paths,
    password: kPassword
  }))
})

test.serial('remove() valid did, valid password, invalid directory (1), valid directory (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./doesnotexist', './bin']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })

  await t.notThrows(remove({
    did,
    paths,
    password: kPassword
  }))

  t.true(await allFilesUnlinked(afs, paths[1]))
})

test.serial('remove() valid did, valid password, invalid path (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./doesnotexist.js']

  await t.notThrows(remove({ 
    did, 
    paths, 
    password: kPassword 
  }))

  await t.throws(afs.access(paths[0]), Error, '')
})

test.serial('remove() valid did, valid password, invalid path (1), valid path (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./doesnotexist.js', './index.js']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })

  await t.notThrows(remove({ 
    did, 
    paths, 
    password: kPassword 
  }))

  for (const path of paths) {
    await t.throws(afs.access(path), Error, '')
  }
})

test.serial('remove() valid did, invalid password, no paths', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  await t.throws(remove({ 
    did, 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.remove: Expecting one or more filepaths to remove')
})

test.serial('remove() valid did, invalid password, valid path (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./index.js']

  await t.throws(remove({ 
    did, 
    paths, 
    password: 'wrongpass' 
  }), Error, 'ara-filesystem.create: incorrect password')
})

test.serial('remove() valid did, invalid password, valid path (2)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./index.js', './add.js']

  await t.throws(remove({ 
    did, 
    paths, 
    password: 'wrongpass' 
  }), Error, 'ara-filesystem.create: incorrect password')
})

test.serial('remove() invalid did, valid password, no paths', async (t) => {
  await t.throws(remove({ 
    did: 'invaliddid', 
    password: kPassword 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('remove() invalid did, valid password, valid path (1)', async (t) => {
  const paths = ['./index.js']

  await t.throws(remove({ 
    did: 'invaliddid', 
    paths, 
    password: kPassword 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('remove() invalid did, invalid password, no paths', async (t) => {
  await t.throws(remove({ 
    did: 'invaliddid', 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.remove: Expecting one or more filepaths to remove')
})

test.serial('remove() invalid did, invalid password, valid path (1)', async (t) => {
  const paths = ['./index.js']

  await t.throws(remove({ 
    did: 'invaliddid', 
    paths, 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('remove() invalid did, invalid password, valid path (1), invalid path(1)', async (t) => {
  const paths = ['./index.js', './doesnotexist.js']

  await t.throws(remove({ 
    did: 'invaliddid', 
    paths, 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test.serial('remove() invalid did, valid password, valid path (1), invalid path (1)', async (t) => {
  const paths = ['./index.js', './doesnotexist.js']

  await t.throws(remove({ 
    did: 'invaliddid', 
    paths, 
    password: kPassword 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

async function allFilesUnlinked(afs, path) {
  try {
    await afs.access(path)
    return false
  } catch (err) {}

  const src = resolve(path)
  const fsFiles = fs.readdirSync(path)

  let unlinked = true

  for (let i = 0; i < fsFiles.length; i++) {
    const fsFilePath = join(src, fsFiles[i])
    const afsFilePath = fsFilePath.replace(process.cwd(), afs.HOME)

    if (await pify(isDirectory)(fsFilePath)) {
      const nestedPath = afsFilePath.replace(afs.HOME, '.')
      if (await allFilesUnlinked(afs, nestedPath)) {
        continue
      } else {
        return false
      }
    } else {
      try {
        await afs.access(afsFilePath)
        return false
      } catch (err) {
        continue
      }
    }
  }
  return true
}
