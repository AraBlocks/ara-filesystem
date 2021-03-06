<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-filesystem
========
[![Build Status](https://travis-ci.com/AraBlocks/ara-filesystem.svg?token=34qxpAeMHQ3yJvunfTbQ&branch=master)](https://travis-ci.com/AraBlocks/ara-filesystem)

The Ara Filesystem, standalone and secure filesystems backed by Ara identities.

## Stability

> [Stability][stability-index]: 2 - Stable. Stable. Compatibility with the npm ecosystem is a high priority.

Although the API is stable, this project is still in alpha development and is not yet ready to be used in a production environment.

## Dependencies

- [Node](https://nodejs.org/en/download/)
- [Truffle](https://www.npmjs.com/package/truffle)

## Installation

```sh
$ npm install ara-filesystem --save
```

## Usage

>**Important**: Each CLI command that makes changes to the AFS requires the password of the owner identity (the one created with `aid create`). Do not forget this password, as it's the only way to update the AFS.

### Create an AFS

Run the create command with a valid owner identity.

```sh
$ afs create did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
```
Store the mnemonic phrase in a safe place as it is the only recovery mechanism for your AFS.

> **Note**: The `did:ara:` prefix is optional for all commands.

### Add a file to an AFS

Adding files and/or directories can be done with the `add` command.

```sh
$ afs add <did> <pathspec...>
```

Example:

```sh
$ afs add df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 my_video.mp4
```

### Remove a file from an AFS

```sh
$ afs remove <did> <pathspec...>
```

Example:

```sh
$ afs remove df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 my_video.mp4
```

### .afsignore

A `.afsignore` file can be used to specify any files or directories to ignore when adding to an AFS. Only a `.afsignore` file located at the directory where the `afs` command is run will be honored.

Each line in `afsignore` specifies a pattern, similar to [`.npmignore`](https://docs.npmjs.com/misc/developers#keeping-files-out-of-your-package) and [`.gitignore`](https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository#Ignoring-Files) files:

* Blank lines or lines starting with # are ignored.
* Standard glob patterns work.
* You can end patterns with a forward slash / to specify a directory.
* You can negate a pattern by starting it with an exclamation point !.

By default, `.afs/` and `.afsignore` are ignored.

An example `.afsignore` file (taken from the `.gitignore` link above):

```
# ignore all .a files
*.a

# but do track lib.a, even though you're ignoring .a files above
!lib.a

# only ignore the TODO file in the current directory, not subdir/TODO
/TODO

# ignore all files in any directory named build
build/

# ignore doc/notes.txt, but not doc/server/arch.txt
doc/*.txt

# ignore all .pdf files in the doc/ directory and any of its subdirectories
doc/**/*.pdf
```

### Deploy an AFS proxy

Before you can commit to an AFS, a proxy contract representing that AFS must be deployed to the network.

```sh
$ afs deploy df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
```

### Commit file(s) to an AFS

Every change in the AFS saved to a local file on disc, much like staged commits. Changes must be commited before they are discoverable and published to the Ara network.

```sh
$ afs commit df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
```

### Price an AFS

Set the price of an AFS by passing in an AFS identity and price in ara tokens. For example, this sets the price of the AFS to 10 ara tokens:

```sh
$ afs set-price df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 10
```

To verify set price:

```sh
$ afs get-price df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
```

## API

> All transaction callbacks (`onhash`, `onreceipt`, `onconfirmation`, `onerror`, and `onmined`) are optional. For more information, see [`ara-util`](https://github.com/AraBlocks/ara-util#sendSignedTransaction) and [`ara-contracts`](https://github.com/AraBlocks/ara-contracts).

* [async create(opts)](#create)
* [async destroy(opts)](#destroy)
* [async add(opts)](#add)
* [async remove(opts)](#remove)
* [async deploy(opts)](#deploy)
* [async commit(opts)](#commit)
* [async setPrice(opts)](#setprice)
* [async getPrice(opts)](#getprice)
* [async unarchive(opts)](#unarchive)
* [async isUpdateAvailable(opts)](#isupdateavailable)
* [async metadata.writeFile(opts)](#writefile)
* [async metadata.writeKey(opts)](#writekey)
* [async metadata.writeKeys(opts)](#writekeys)
* [async metadata.readKey(opts)](#readkey)
* [async metadata.delKey(opts)](#delkey)
* [async metadata.clear(opts)](#clear)
* [async metadata.readFile(opts)](#readfile)
* [async ownership.estimateRequestGasCost(opts)](#estimaterequest)
* [async ownership.estimateRevokeGasCost(opts)](#estimaterevoke)
* [async ownership.estimateApproveGasCost(ops)](#estimateapprove)
* [async ownership.request(opts)](#requestownership)
* [async ownership.revokeRequest(opts)](#revokerequest)
* [async ownership.approveTransfer(opts)](#approvetransfer)
* [async ownership.claim(opts)](#claim)

<a name="create"></a>
### `async create(opts)`

If `owner` is given, this function will create a new AFS with the owning identity `owner`. If `did` is given, it attempts to get a reference to a previously created AFS.

- `opts`
  - `did` - The `DID` of an existing `AFS`
  - `owner` - `DID` of the owner of the `AFS` to be created
  - `password` - The password of the `owner` of this `AFS`; this is only required for writing to the `AFS`.
  - `afsPassword` - The password of the `AFS`; this is only required for writing to the `AFS`.
  - `storage` - Optional storage function to use for the `AFS`
  - `keyringOpts` - Optional keyring options

Returns the `AFS` `object`.

To create a new `AFS`:

```js
const aid = require('ara-identity')
const { create } = require('ara-filesystem')

const identity = await aid.create({ context, password })
await writeIdentity(identity)
const { publicKey: owner } = identity


const { afs } = await create({ owner, password, afsPassword })
```

To obtain a reference to an existing `AFS`:

```js
const did = did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
const { afs } = await create({ did })
```

>**Note**: Either `did` or `owner` is required, but not both.

<a name="destroy"></a>
### `async destroy(opts)`

Destroys the local copy of an `AFS` and unlists it from the blockchain (if owner), effectively removing it from the Ara network.

- `opts`
  - `did` - The `DID` of the `AFS` to be destroyed
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `mnemonic` - The mnemonic for this `AFS`
  - `keyringOpts` - Optional keyring options

If an estimate, returns the `cost` (in ETH), otherwise returns the transaction receipt.

```js
const { create, destroy } = require('ara-filesystem')
const { afs, mnemonic } = await create({ owner, password, afsPassword })
const { did } = afs
await destroy({
  did,
  mnemonic,
  password,
  afsPassword
})
```

<a name="add"></a>
### `async add(opts)`

Adds one or more files to an existing `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to add files to
  - `password` - The password of the `AFS`
  - `force` - Force add the path(s)
  - `paths` - The path(s) of the files to add
  - `keyringOpts` - Optional keyring options

Returns the `AFS` `object`.

```js
const { create, add } = require('ara-filesystem')
let { afs } = await create({ owner, password })
const { did } = afs
const paths = ['./index.js', './add.js', './picture.png']
afs = await add({
  did,
  paths,
  password
})
```

<a name="remove"></a>
### `async remove(opts)`

Removes one or more files from an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` where the files are located
  - `password` - The password of the `AFS`
  - `paths` - The path(s) of the files to remove
  - `keyringOpts` - Optional keyring options

Returns the `AFS` `object`.

```js
const { remove } = require('ara-filesystem')
const afs = await remove({
  did,
  paths,
  password
})
```

<a name="deploy"></a>
### `async deploy(opts)`

Deploys an AFS proxy to the network. Returns the Ethereum address of the deploy contract (if not an estimation).

- `opts`
  - `did` - `DID` of the `AFS` to deploy
  - `password` - Owner's password for this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `estimate` - Optional flag to check cost of `deploy`
  - `gasPrice` - Optional gas price in GWei
  - `keyringOpts` - Optional keyring options
  - `onhash`
  - `onreceipt`
  - `onconfirmation`
  - `onerror`
  - `onmined`

If an estimate, returns the `cost` (in ETH), otherwise returns the Ethereum address where the contract was deployed.

```js
const { deploy } = require('ara-filesystem')
const address = await deploy({
  afsPassword,
  password,
  did
})

// estimate deploy
const cost = await deploy({
  estimate: true,
  afsPassword,
  password,
  did
})
```

<a name="commit"></a>
### `async commit(opts)`

Commits any changes to an `AFS` to the blockchain. Calling `deploy` is required before any commits can occur.

- `opts`
  - `did` - The `DID` of the `AFS` to commit
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `estimate` - Optional flag to check cost of `commit`
  - `estimateDid` - Optional `DID` of a proxy which points to an estimate version of an AFS Standard (used for estimating cost without `deploy` first)
  - `price` - Optional price in Ara tokens to set this `AFS`
  - `gasPrice` - Optional gas price in GWei
  - `keyringOpts` - Optional keyring options
  - `writeCallbacks` - Optional callbacks for the Write transaction
    - `onhash`
    - `onreceipt`
    - `onconfirmation`
    - `onerror`
    - `onmined`
  - `priceCallbacks` - Optional callbacks for the Price transaction
    - `onhash`
    - `onreceipt`
    - `onconfirmation`
    - `onerror`
    - `onmined`

If an estimate, returns the `cost` (in ETH), otherwise returns the transaction receipt.

```js
const { commit } = require('ara-filesystem')
const result = await commit({
  afsPassword,
  password,
  price,
  did
})

// estimate commit cost
const cost = await commit({
  estimate: true,
  afsPassword,
  password,
  price,
  did
})
```

<a name="setprice"></a>
### `async setPrice(opts)`

Sets the price in Ara tokens of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to set the price of
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `price` - The price (in Ara) to purchase this `AFS`
  - `estimate` - Optional flag to check cost of `setPrice`
  - `estimateDid` - Optional `DID` of a proxy which points to an estimate version of an AFS Standard (used for estimating cost without `deploy` first)
  - `gasPrice` - Optional gas price in GWei
  - `keyringOpts` - Optional keyring options
  - `onhash`
  - `onreceipt`
  - `onconfirmation`
  - `onerror`
  - `onmined`

If an estimate, returns the `cost` (in ETH), otherwise returns the transaction receipt.

```js
const { setPrice } = require('ara-filesystem')
const price = 10
await setPrice({
  afsPassword,
  password,
  price,
  did
})

// estimate set price cost
const cost = await setPrice({
  estimate: true,
  afsPassword
  password,
  price,
  did
})
```

<a name="getprice"></a>
### `async getPrice(opts)`

Gets the price in Ara tokens of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to get the price of

If an estimate, returns the `cost` (in ETH) as a `string`.

```js
const { getPrice } = require('ara-filesystem')
const price = await getPrice({ did })
```

<a name="unarchive"></a>
### `async unarchive(opts)`

> **Stability: 2** Stable

Unarchives (unzips) an `AFS` to a specified location.

- `opts`
  - `did` - The `DID` of the `AFS` to unarchive
  - `path` - Optional path to the `AFS`
  - `keyringOpts` - Optional keyring options

```js
const { unarchive } = require('ara-filesystem')
await unarchive({
  did,
  path
})
```

<a name="isupdateavailable"></a>
### `async isUpdateAvailable(opts)`

Compares local `AFS` version to what has been published. Returns `true` if the published `AFS` version is greater than the local, otherwise `false`.

- `opts`
  - `did` - The `DID` of the `AFS` to check
  - `keyringOpts` - Optional keyring options

Returns a `boolean`.

```js
const { isUpdateAvailable } = require('ara-filesystem')
const available = await isUpdateAvailable({ did: 'df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9' })
```

<a name="writefile"></a>
### `async metadata.writeFile(opts)`

Writes a metadata JSON file to the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to write to
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `filepath` - The path of the metadata JSON file to copy
  - `keyringOpts` - Optional keyring options

Returns the updated metadata `object`.

```js
const { metadata } = require('ara-filesystem')

const result = await metadata.writeFile({
  did,
  password,
  filepath,
  afsPassword
})
```

<a name="writekey"></a>
### `async metadata.writeKey(opts)`

Writes a metadata key/value pair to the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to write to
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `key` - The key to write
  - `value` - The value to write
  - `keyringOpts` - Optional keyring options

Returns the updated metadata `object`.

```js
const { metadata } = require('ara-filesystem')

const key = 'foo'
const value = 'bar'
const result = await metadata.writeKey({
  did,
  key,
  value,
  password,
  afsPassword
})
```

<a name="writekeys"></a>
### `async metadata.writeKeys(opts)`

Writes multiple key/value pairs to the metadata parition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to write to
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `keys` - Object containing the key/value pairs to write
  - `keyringOpts` - Optional keyring options

Returns the updated metadata `object`.

```js
const { metadata } = require('ara-filesystem')

const keys = { foo: 'bar', hello: 'world' }
await metadata.writeKeys({
  did,
  keys,
  password,
  afsPassword
})
```

<a name="readkey"></a>
### `async metadata.readKey(opts)`

Reads a metadata key from the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to read from
  - `key` - The key to write

Returns the `value` of the metadata `key`.

```js
const { metadata } = require('ara-filesystem')

const result = await metadata.readKey({
  did,
  key
})
```

<a name="delkey"></a>
### `async metadata.delKey(opts)`

Deletes a metadata key/value pair from the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to delete from
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`
  - `key` - The key to write
  - `keyringOpts` - Optional keyring options

Returns the updated metadata `object`.

```js
const { metadata } = require('ara-filesystem')

await metadata.delKey({
  did,
  key,
  password,
  afsPassword
})
```

<a name="clear"></a>
### `async metadata.clear(opts)`

Empties all metadata contents of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` whose metadata is to be emptied
  - `password` - The password of the owner of this `AFS`
  - `afsPassword` - The password of the `AFS`

```js
const { metadata } = require('ara-filesystem')
await metadata.clear({ did, password, afsPassword })
```

<a name="readfile"></a>
### `async metadata.readFile(opts)`

Reads all metadata from an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to read from

Returns the updated metadata `object`.

```js
const { metadata } = require('ara-filesystem')
const contents = await metadata.readFile({ did })
```

<a name="estimaterequest"></a>
### `ownership.estimateRequestGasCost(opts)`

Gets the estimated gas cost of requesting ownership of an AFS.

>**Note**: This function takes the same arguments as `ownership.request(opts)`

Returns the `cost` (in ETH) as a `string`.

```js
const { ownership } = require('ara-filesystem')
const cost = await ownership.estimateRequestGasCost(opts) // 0.015 ETH
```

<a name="estimaterevoke"></a>
### `ownership.estimateRevokeGasCost(opts)`

Gets the estimated gas cost of revoking a previous ownership request.

>**Note**: This function takes the same arguments as `ownership.revokeRequest(opts)`

Returns the `cost` (in ETH) as a `string`.

```js
const { ownership } = require('ara-filesystem')
const cost = await ownership.estimateRevokeGasCost(opts) // 0.015 ETH
```

<a name="estimateapprove"></a>
### `ownership.estimateApproveGasCost(opts)`

Gets the estimated gas cost of approving an ownership request.

>**Note**: This function takes the same arguments as `ownership.approveTransfer(opts)`

Returns the `cost` (in ETH) as a `string`.

```js
const { ownership } = require('ara-filesystem')
const cost = await ownership.estimateApproveGasCost(opts) // 0.015 ETH
```

<a name="requestownership"></a>
### `ownership.request(opts)`

Requests the transfer of ownership of an AFS to `requesterDid`. Must be approved by the current owner. This transaction will revert if a request is already active.

- `opts`
  - `requesterDid` - `DID` of the requester
  - `contentDid` - `DID` of the AFS to request ownership for
  - `password` - password of the requester
  - `estimate` - Optional flag to check cost of `request`
  - `gasPrice` - Optional gas price in GWei
  - `keyringOpts` - Optional keyring options
  - `onhash`
  - `onreceipt`
  - `onconfirmation`
  - `onerror`
  - `onmined`

Returns the transaction receipt as an `object`.

```js
const { ownership } = require('ara-filesystem')
const requesterDid = 'did:ara:a51aa651c5a28a7c0a8de007843a00dcd24f3cc893522d3fb093c2bb7a323785'
const password = 'pass'
const contentDid = 'did:ara:114045f3883a21735188bb02de024a4e1451cb96c5dcc80bdfa1b801ecf81b85'
const receipt = await ownership.request({ requesterDid, password, contentDid })
```

<a name="revokerequest"></a>
### `ownership.revokeRequest(opts)`

Revokes a previous request for AFS ownership transfer. This transaction will revert if there isn't an active request.

- `opts`
  - `requesterDid` - `DID` of the requester
  - `contentDid` - `DID` of the AFS to revoke ownership reequest for
  - `password` - password of the requester
  - `estimate` - Optional flag to check cost of `revokeRequest`
  - `gasPrice` - Optional gas price in GWei
  - `keyringOpts` - Optional keyring options
  - `onhash`
  - `onreceipt`
  - `onconfirmation`
  - `onerror`
  - `onmined`

Returns the transaction receipt as an `object`.

```js
const { ownership } = require('ara-filesystem')
const requesterDid = 'did:ara:a51aa651c5a28a7c0a8de007843a00dcd24f3cc893522d3fb093c2bb7a323785'
const password = 'pass'
const contentDid = 'did:ara:114045f3883a21735188bb02de024a4e1451cb96c5dcc80bdfa1b801ecf81b85'
const receipt = await ownership.revokeRequest({ requesterDid, password, contentDid })
```

<a name="approvetransfer"></a>
### `ownership.approveTransfer(opts)`

Approves a pending transfer request, this officially transfers ownership for the given AFS. If not an estimate, this function will return an object containing a random password to be delivered to the identity claiming ownership, along with the transaction receipt.

- `opts`
  - `contentDid` - `DID` of the content to change ownership for
  - `password` - Password of the staged owner
  - `afsPassword` - The password of the `AFS`
  - `newOwnerDid` - `DID` of the owner to transfer ownership to
  - `mnemonic` - mnemonic associated with the AFS
  - `estimate` - Optional flag to check cost of `approveTransfer`
  - `gasPrice` - Optional gas price in GWei
  - `keyringOpts` - Optional keyring options
  - `onhash`
  - `onreceipt`
  - `onconfirmation`
  - `onerror`
  - `onmined`

Returns `object`:
  - `receipt` - transaction receipt
  - `password` - randomly generated password

```js
const { ownership } = require('ara-filesystem')
const contentDid = 'did:ara:a51aa651c5a28a7c0a8de007843a00dcd24f3cc893522d3fb093c2bb7a323785'
const password = 'pass'
const afsPassword = 'password'
const newOwnerDid = 'did:ara:7dc039cfb220029c371d0f4aabf4a956ed0062d66c447df7b4595d7e11187271'
const mnemonic = 'cargo diary bracket crumble stable chief grief grab frost seven wet repeat'
const result = await ownership.approveTransfer({ contentDid, password, afsPassword, newOwnerDid, mnemonic })
```

<a name="claim"></a>
### `ownership.claim(opts)`

Fully claims ownership of an AFS after it has been transferred by the previous owner.

- `opts`
  - `currentPassword` - random password generated from the previous owner
  - `newPassword` - new password for this AFS identity
  - `contentDid` - `DID` of the content to claim ownership for
  - `mnemonic` - mnemonic associated with the AFS to claim
  - `keyringOpts` - Optional keyring options

```js
const { ownership } = require('ara-filesystem')
const contentDid = 'did:ara:a51aa651c5a28a7c0a8de007843a00dcd24f3cc893522d3fb093c2bb7a323785'
const currentPassword = 'generatedPassword'
const newPassword = 'secureNewPassword'
const mnemonic = 'cargo diary bracket crumble stable chief grief grab frost seven wet repeat'

await ownership.claim({
  currentPassword,
  newPassword,
  contentDid,
  mnemonic
})
```

## Contributing
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](/.github/CONTRIBUTING.md)

Releases follow [Semantic Versioning](https://semver.org/)

## See Also

- [Truffle](https://github.com/trufflesuite/truffle)
- [ara-identity](https://github.com/AraBlocks/ara-identity)

## License
LGPL-3.0
