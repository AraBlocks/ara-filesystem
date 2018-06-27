const { add } = require('../add')
const test = require('ava')
const { kTestOwnerDid, kTestOwnerDidNoMethod } = require('./_constants')

test('add() nothing', async (t) => {
  const afs = await create({ owner: kTestOwnerDid })
  const { did } = afs

  
})
