/* eslint quotes: "off" */

const test = require('ava')
const { remove } = require('../remove')

const {
  kTestOwnerDid,
  kPassword
} = require('./_constants')

// empty paths
// paths that are not strings
// paths that do not exist
test("remove() invalid paths", async (t) => {
  
})

// empty DID
// wrong prefix
// incorrect length
// doesn't exist
test("remove() invalid did", async (t) => {

})

// empty password
test("remove() invalid password", async (t) => {

})

// incorrect password
test("remove() incorrect password", async (t) => {

})

// correct params
// remove file
// remove directory
test("remove() valid params", async (t) => {

})

