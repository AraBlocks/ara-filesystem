const mirror = require('mirror-folder')
const crypto = require('ara-crypto')
const aid = require('ara-identity')
const rimraf = require('rimraf')
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
  parse
} = require('path')

const {
  create,
  unarchive,
  add
} = require('../')

const kTestFilename = 'hello.txt'

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
  t.context = { afs, idPath: aid.createIdentityKeyPath(afs.ddo) }
})

test.afterEach(async (t) => {
  const { idPath } = t.context
  if (idPath) {
    await pify(rimraf)(idPath)
  }
})

test('unarchive() invalid opts', async (t) => {
  const afs = getAFS(t)
  const { did } = afs

  // validate DID
  await t.throwsAsync(unarchive(), TypeError)
  await t.throwsAsync(unarchive({ }), TypeError)
  await t.throwsAsync(unarchive({ did: 1234 }), TypeError)

  // validate path
  await t.throwsAsync(unarchive({ did, path: 123 }), TypeError)
})

test('unarchive() empty AFS', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  await t.throwsAsync(unarchive({ did }), Error)
})

test('unarchive() valid unarchive', async (t) => {
  const afs = getAFS(t)
  const { did } = afs
  // create test file and add to test AFS
  await pify(fs.writeFile)(resolve(kTestFilename), 'Hello World!')
  await add({ did, password, paths: [ kTestFilename ] })

  // test unarchive to cwd
  await unarchive({ did })
  await t.notThrowsAsync(pify(fs.access)(kTestFilename))
  const result = await pify(fs.readFile)(kTestFilename, 'utf8')
  t.is(result, 'Hello World!')
})

test.after(() => {
  fs.unlinkSync(kTestFilename)
})
