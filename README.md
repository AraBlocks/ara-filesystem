<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-filesystem
========
[![Build Status](https://travis-ci.com/AraBlocks/ara-filesystem.svg?token=34qxpAeMHQ3yJvunfTbQ&branch=master)](https://travis-ci.com/AraBlocks/ara-filesystem)

The Ara FileSystem, isolated and secure file systems backed by Ara identities.

## Status

This project is still in alpha development.

> **Important**: While this project is under active development, run `npm link` in `ara-filesystem` directory with `ara-identity`, `ara-util`, `ara-contracts`, `ara-network`, `ara-network-node-identity-archiver`, and `ara-network-node-identity-resolver` cloned locally.

## Dependencies

- [Node](https://nodejs.org/en/download/)
- [Truffle](https://www.npmjs.com/package/truffle)

## Installation

```sh
$ npm install --save ara-filesystem
```

## Usage

>**Important**: Each CLI command requires the password of the owner identity (the one created with `aid create`). Do not forget this password, as it's the only way to interact with the AFS.

### Prerequisites

- **Note:** There is an `install-afs` script in `/bin`, move it to the parent folder of this folder (`$ cd ..`) and run it. You shouldn't have to do any installation, linking or secret generation.
- Clone the following repositories
  - `ara-identity`
  - `ara-contracts`
  - `ara-util`
  - `ara-network`
  - `ara-network-node-identity-archiver`
  - `ara-network-node-identity-resolver`
- Be sure to `npm install` and `npm link` for each
- Test the CLI by running the following commands,
  - `$ aid --help`
  - `$ ann --help`
  - `$ ank --help`

- Generate secrets for both the Archiver & Resolver nodes

      $ ank -i <did> -s ara-archiver -n remote1 -o ~/.ara/keyrings/ara-archiver  // Generating secrets for the archiver node
      $ ank -i <did> -s ara-resolver -n remote2 -o ~/.ara/keyrings/ara-resolver  // Generating secrets for the resolver node

- Once the secrets are generated, the Archiver & Resolver Network nodes can be started.
  - Be sure to have cloned the [archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver) and [resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver) repositories
  - Ensure you have ran `npm install` in each of the repositories
  - Open the repository folder in 2 separate windows and run the below command,
      ```sh
      $ ann -t . -s ara-archiver -n remote1 -k ~/.ara/keyrings/ara-archiver -i <did>  // in 'ara-network-node-identity-archiver'
      $ ann -t . -s ara-resolver -n remote2 -k ~/.ara/keyrings/ara-resolver -i <did>  // in 'ara-network-node-identity-resolver'
      ```
- To communicate with the [Ara privatenet blockchain](https://github.com/AraBlocks/ara-privatenet) and deploy an AFS proxy, you must be running a local geth node.

### Create an Ara Identity

Run the create command found in [aid](https://github.com/AraBlocks/ara-identity).

```sh
$ aid create
```

> **Important**: Do not lose your password and mnemonic as your account cannot be recovered without them.

Archive the identity.

```sh
$ aid archive <did> -s ara-archiver -n remote1 -k ~/.ara/keyrings/ara-archiver.pub
```

Once successfully archived, resolve the identity:

```sh
$ aid resolve <did> -s ara-resolver -n remote2 -k ~/.ara/keyrings/ara-resolver.pub --cache==false
```

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

* [async create(opts)](#create)
* [async destroy(opts)](#destroy)
* [async add(opts)](#add)
* [async remove(opts)](#remove)
* [async deploy(opts)](#deploy)
* [async commit(opts)](#commit)
* [async setPrice(opts)](#setprice)
* [async getPrice(opts)](#getprice)
* [async unarchive(opts)](#unarchive)
* [async metadata.writeFile(opts)](#writefile)
* [async metadata.writeKey(opts)](#writekey)
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

> **Stability: 2** Stable

Creates/obtains and returns a reference to an `AFS`.

- `opts`
  - `did` - The `DID` of an existing `AFS`
  - `owner` - `DID` of the owner of the `AFS` to be created
  - `password` - The password of the `owner` of this `AFS`
  - `storage` - optional Storage function to use for the `AFS`
  - `keyringOpts` - optional Keyring options

To create a new `AFS`:

```js
const identity = await aid.create({ context, password })
await writeIdentity(identity)
const { publicKey: owner } = identity
const { afs } = await create({ owner, password })
```

To obtain a reference to an existing `AFS`:

```js
const did = did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
const { afs } = await create({ did, password })
```

<a name="destroy"></a>
### `async destroy(opts)`

> **Stability: 2** Stable

Destroys the local copy of an `AFS` and unlists it from the blockchain (if owner).

- `opts`
  - `did` - The `DID` of the `AFS` to be destroyed
  - `password` - The password of the owner of this `AFS`
  - `mnemonic` - The mnemonic for this `AFS`

```js
const { afs, mnemonic } = await create({ owner, password })
const { did } = afs
await destroy({
  did,
  mnemonic,
  password
})
```

<a name="add"></a>
### `async add(opts)`

> **Stability: 2** Stable

Adds one or more files to an existing `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to add files to
  - `password` - The password of the owner of this `AFS`
  - `force` - Force add the path(s)
  - `paths` - The path(s) of the files to add

```js
let { afs, mnemonic } = await create({ owner, password })
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

> **Stability: 2** Stable

Removes one or more files from an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` where the files are located
  - `password` - The password of the owner of this `AFS`
  - `paths` - The path(s) of the files to remove

```js
const afs = await remove({
  did,
  paths,
  password
})
```

<a name="deploy"></a>
### `async deploy(opts)`

> **Stability: 2** Stable

Deploys an AFS proxy to the network.

- `opts`
  - `did` - `DID` of the `AFS` to deploy
  - `password` - Owner's password for this `AFS`
  - `estimate` - optional Flag to check cost of `deploy`

```js
const address = await deploy({
  password,
  did
})

// estimate deploy
const cost = await deploy({
  estimate: true,
  password,
  did
})
```

<a name="commit"></a>
### `async commit(opts)`

> **Stability: 2** Stable

Commits any changes to an `AFS` to the blockchain.

- `opts`
  - `did` - The `DID` of the `AFS` to commit
  - `password` - The password of the owner of this `AFS`
  - `estimate` - optional Flag to check cost of `commit`
  - `price` - optional Price in Ara tokens to set this `AFS`

```js
const result = await commit({
  password,
  price,
  did
})

// estimate commit cost
const cost = await commit({
  estimate: true,
  password,
  price,
  did
})
```

<a name="setprice"></a>
### `async setPrice(opts)`

> **Stability: 2** Stable

Sets the price in Ara tokens of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to set the price of
  - `password` - The password of the owner of this `AFS`
  - `price` - The price in Ara tokens to set this `AFS`
  - `estimate` - optional Flag to check cost of `setPrice`

```js
const price = 10
await setPrice({
  did,
  password,
  price
})

// estimate set price cost
const cost = await setPrice({
  estimate: true,
  password,
  price,
  did
})
```

<a name="getprice"></a>
### `async getPrice(opts)`

> **Stability: 2** Stable

Gets the price in Ara tokens of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to get the price of

```js
const price = await getPrice({ did })
```

<a name="estimateprice"></a>
### `async estimateSetPriceGasCost(opts)`

> **Stability: 2** Stable

Estimates the cost (in ETH) of setting the price of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to set the price of
  - `password` - The password of the owner of this `AFS`
  - `price` - The price in Ara tokens to set this `AFS`

```js
const cost = await estimateSetPriceGasCost({ did, password, price })
```

<a name="unarchive"></a>
### `async unarchive(opts)`

> **Stability: 2** Stable

Unarchives an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to unarchive
  - `path` - optional Path to the `AFS`

```js
await unarchive({
  did,
  path
})
```

<a name="writefile"></a>
### `async metadata.writeFile(opts)`

> **Stability: 2** Stable

Writes a metadata JSON file to the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to write to
  - `filepath` - The path of the metadata JSON file to copy

```js
const result = await metadata.writeFile({
  did,
  filepath
})
```

<a name="writekey"></a>
### `async metadata.writeKey(opts)`

> **Stability: 2** Stable

Writes a metadata key/value pair to the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to write to
  - `key` - The key to write
  - `value` - The value to write

```js
const key = 'foo'
const value = 'bar'
const result = await metadata.writeKey({
  did,
  key,
  value
})
```

<a name="readkey"></a>
### `async metadata.readKey(opts)`

> **Stability: 2** Stable

Reads a metadata key from the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to read from
  - `key` - The key to write

```js
const result = await metadata.readKey({
  did,
  key
})
```

<a name="delkey"></a>
### `async metadata.delKey(opts)`

> **Stability: 2** Stable

Deletes a metadata key/value pair from the metadata partition of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to delete from
  - `key` - The key to write

```js
await metadata.delKey({
  did,
  key
})
```

<a name="clear"></a>
### `async metadata.clear(opts)`

> **Stability: 2** Stable

Empties all metadata contents of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` whose metadata is to be emptied

```js
await afs.metadata.clear({ did })
```

<a name="readfile"></a>
### `async metadata.readFile(opts)`

> **Stability: 2** Stable

Reads all metadata from an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to read from

```js
const contents = await metadata.readFile({ did })
```

<a name="estimaterequest"></a>
### `ownership.estimateRequestGasCost(opts)`

Gets the estimated gas cost of requesting ownership of an AFS.

>**Note**: This function takes the same arguments as `ownership.request(opts)`

```js
const cost = await ownership.estimateRequestGasCost(opts) // 0.015 ETH
```

<a name="estimaterevoke"></a>
### `ownership.estimateRevokeGasCost(opts)`

Gets the estimated gas cost of revoking a previous ownership request.

>**Note**: This function takes the same arguments as `ownership.revokeRequest(opts)`

```js
const cost = await ownership.estimateRevokeGasCost(opts) // 0.015 ETH
```

<a name="estimateapprove"></a>
### `ownership.estimateApproveGasCost(opts)`

Gets the estimated gas cost of approving an ownership request.

>**Note**: This function takes the same arguments as `ownership.approveTransfer(opts)`

```js
const cost = await ownership.estimateApproveGasCost(opts) // 0.015 ETH
```

<a name="requestownership"></a>
### `ownership.request(opts)`

Requests the transfer of ownership of an AFS to `requesterDid`. Must be approved by the current owner. This transaction will revert if a request is already active.

- `opts`
  - `requesterDid` - `DID` of the requester
  - `contentDid` - `DID` of the AFS to request ownership for
  - `password` - password of the requester
  - `estimate` - optional Flag to check cost of `request`

```js
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
  - `estimate` - optional Flag to check cost of `revokeRequest`

```js
const requesterDid = 'did:ara:a51aa651c5a28a7c0a8de007843a00dcd24f3cc893522d3fb093c2bb7a323785'
const password = 'pass'
const contentDid = 'did:ara:114045f3883a21735188bb02de024a4e1451cb96c5dcc80bdfa1b801ecf81b85'
const receipt = await ownership.revokeRequest({ requesterDid, password, contentDid })
```

<a name="approvetransfer"></a>
### `ownership.approveTransfer(opts)`

Approves a pending transfer request, this officially transfers ownership for the given AFS. If not an estimate, this function will return an object containing a random password to be delivered to the identity claiming ownership, along with the transaction receipt.

- `opts`
  - `did` - `DID` of the content to change ownership for
  - `password` - Password of the staged owner
  - `newOwnerDid` - `DID` of the owner to transfer ownership to
  - `mnemonic` - mnemonic associated with the AFS
  - `estimate` - optional Flag to check cost of `approveTransfer`

```js
const did = 'did:ara:a51aa651c5a28a7c0a8de007843a00dcd24f3cc893522d3fb093c2bb7a323785'
const password = 'pass'
const newOwnerDid = 'did:ara:7dc039cfb220029c371d0f4aabf4a956ed0062d66c447df7b4595d7e11187271'
const result = await ownership.approveOwnershipTransfer({ did, password, newOwnerDid })
```

<a name="claim"></a>
### `ownership.claim(opts)`

Fully claims ownership of an AFS after it has been transferred by the previous owner.

- `opts`
  - `currentPassword` - random password generated from the previous owner
  - `newPassword` - new password for this AFS identity
  - `contentDid` - `DID` of the content to claim ownership for
  - `mnemonic` - mnemonic associated with the AFS to claim

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
