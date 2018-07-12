const { add } = require('../add')
const { create } = require('../create')
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

test('add() valid did, valid password, no paths', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs
  afs.close()

  await t.throws(add({ 
    did, 
    password: kPassword 
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test('add() valid did, valid password, valid path (1)', async (t) => {
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

  const buf = await afs.readFile(paths[0])
  afs.close()
  t.is(Buffer.compare(buf, fs.readFileSync(paths[0])), 0)
})

test('add() valid did, valid password, valid path (3)', async (t) => {
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

  let buf
  for (const path of paths) {
    buf = await afs.readFile(path)
    t.is(Buffer.compare(buf, fs.readFileSync(path)), 0)
  }
  afs.close()
})

test('add() valid did, valid password, valid directory (1, not nested)', async (t) => {
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
  
  t.true(await directoriesAreEqual(afs, paths[0]))
})

test('add() valid did, valid password, valid directory (1, nested)', async (t) => {
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
  t.true(await directoriesAreEqual(afs, paths[0]))
})

test('add() valid did, valid password, valid directory (2, nested)', async (t) => {
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
  t.true(await directoriesAreEqual(afs, paths[0]))
  t.true(await directoriesAreEqual(afs, paths[1]))
})

test('add() valid did, valid password, invalid directory (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs

  const paths = ['./doesnotexist']

  await add({ 
    did, 
    paths, 
    password: kPassword 
  })
  await t.throws(afs.readdir(paths[0]), Error, '')
})

test('add() valid did, valid password, invalid directory (1), valid directory (1)', async (t) => {
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
  
  await t.throws(afs.readdir(paths[0]), Error, '')
  t.true(await directoriesAreEqual(afs, paths[1]))
})

test('add() valid did, valid password, invalid path (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs
  afs.close()

  const paths = ['./doesnotexist.js']

  await t.throws(add({ 
    did, 
    paths, 
    password: kPassword 
  }), Error, 'ara-filesystem.add: File does not exit.')
})

test('add() valid did, valid password, invalid path (1), valid path (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs
  afs.close()

  const paths = ['./doesnotexist.js', './index.js']

  await t.throws(add({ 
    did, 
    paths, 
    password: kPassword 
  }), Error, 'ara-filesystem.add: File does not exit.')
})

test('add() valid did, invalid password, no paths', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs
  afs.close()

  await t.throws(add({ 
    did, 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test('add() valid did, invalid password, valid path (1)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs
  afs.close()

  const paths = ['./index.js']

  await t.throws(add({ 
    did, 
    paths, 
    password: 'wrongpass' 
  }), Error, 'ara-filesystem.create: incorrect password')
})

test('add() valid did, invalid password, valid path (2)', async (t) => {
  const { afs } = await create({ 
    owner: kTestOwnerDid, 
    password: kPassword 
  })
  const { did } = afs
  afs.close()

  const paths = ['./index.js', './add.js']

  await t.throws(add({ 
    did, 
    paths, 
    password: 'wrongpass' 
  }), Error, 'ara-filesystem.create: incorrect password')
})

test('add() invalid did, valid password, no paths', async (t) => {
  await t.throws(add({ 
    did: 'invaliddid', 
    password: kPassword 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, valid password, valid path (1)', async (t) => {
  const paths = ['./index.js']

  await t.throws(add({ 
    did: 'invaliddid', 
    paths, 
    password: kPassword 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, valid password, valid path (1), invalid path (1)', async (t) => {
  const paths = ['./index.js', './doesnotexist.js']

  await t.throws(add({ 
    did: 'invaliddid', 
    paths, 
    password: kPassword 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, invalid password, no paths', async (t) => {
  await t.throws(add({ 
    did: 'invaliddid', 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.add: Expecting one or more filepaths to add')
})

test('add() invalid did, invalid password, valid path (1)', async (t) => {
  const paths = ['./index.js']

  await t.throws(add({ 
    did: 'invaliddid', 
    paths, 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

test('add() invalid did, invalid password, valid path (1), invalid path(1)', async (t) => {
  const paths = ['./index.js', './doesnotexist.js']

  await t.throws(add({ 
    did: 'invaliddid', 
    paths, 
    password: 'wrongpass' 
  }), TypeError, 'ara-filesystem.create: Unable to resolve AFS DID')
})

async function directoriesAreEqual (afs, path) {
  const src = resolve(path)
  const fsFiles = fs.readdirSync(path)
  const afsFiles = await afs.readdir(path)

  if ('object' !== typeof fsFiles || 'object' !== typeof afsFiles) {
    console.log("not objects")
    return false
  }

  if (fsFiles.length !== afsFiles.length) {
    console.log("lengths not equal", fsFiles, afsFiles)
    return false
  }

  for (let i = 0; i < fsFiles.length; i++) {
    if (fsFiles[i] !== afsFiles[i]) return false

    const fsFilePath = join(src, fsFiles[i])
    const afsFilePath = fsFilePath.replace(process.cwd(), afs.HOME)

    if (await pify(isDirectory)(fsFilePath)) {
      const files = fs.readdirSync(fsFilePath)
      const buf = await afs.readdir(afsFilePath)
      const nestedPath = afsFilePath.replace(afs.HOME, '.')
      if (await directoriesAreEqual(afs, nestedPath)) {
        continue
      } else {
        return false
      }
    }
  }
  
  return true
}
