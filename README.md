<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-filesystem
========
[![Build Status](https://travis-ci.com/AraBlocks/ara-filesystem.svg?token=34qxpAeMHQ3yJvunfTbQ&branch=master)](https://travis-ci.com/AraBlocks/ara-filesystem)

The Ara FileSystem, isolated and secure file systems backed by ARA identities.

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

### Create an ARA Identity

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
* [async commit(opts)](#commit)
* [async estimateCommitGasCost(opts)](#estimatecommit)
* [async setPrice(opts)](#setprice)
* [async getPrice(opts)](#getprice)
* [async estimateSetPriceGasCost(opts)](#estimateprice)
* [async unarchive(opts)](#unarchive)
* [async metadata.writeFile(opts)](#writefile)
* [async metadata.writeKey(opts)](#writekey)
* [async metadata.readKey(opts)](#readkey)
* [async metadata.delKey(opts)](#delkey)
* [async metadata.clear(opts)](#clear)
* [async metadata.readFile(opts)](#readfile)

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
const afs = remove({
  did,
  paths,
  password
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
  did,
  password,
  price
})
```

<a name="estimatecommit"></a>
### `async estimateCommitGasCost(opts)`

> **Stability: 2** Stable

Estimates the cost (in ETH) of committing an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to commit
  - `password` - The password of the owner of this `AFS`
  - `price` - optional The price in Ara tokens to set this `AFS`

```js
const cost = await estimateCommitGasCost({
  did,
  password,
  price
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

## Contributing
- [Commit message format](/.github/COMMIT_FORMAT.md)
- [Commit message examples](/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](/.github/CONTRIBUTING.md)

Releases follow [Semantic Versioning](https://semver.org/)

## See Also

- [Truffle](https://github.com/trufflesuite/truffle)
- [ARA Identity](https://github.com/AraBlocks/ara-identity)

## License
LGPL-3.0
