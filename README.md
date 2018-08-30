<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-filesystem
========
![](https://travis-ci.com/AraBlocks/ara-filesystem.svg?token=93ySMW14xn3tP6eZMEza&branch=master)

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

The follow section lists the prerequisites for running the project as well as the available commands. 

>**Important**: Each CLI command requires the password of the owner identity (the one created with `aid create`). Do not forget this password, as it's the only way to interact with your AFS.

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
      ```sh
      $ ank -i <did> -s ara-archiver -n remote1 -o ~/.ara/keyrings/ara-archiver  // Generating secrets for the archiver node
      $ ank -i <did> -s ara-resolver -n remote2 -o ~/.ara/keyrings/ara-resolver  // Generating secrets for the resolver node
      ```

- Once the secrets are generated, the Archiver & Resolver Network nodes can be started.
  - Be sure to have cloned the [archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver) and [resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver) repositories
  - Ensure you have ran `npm install` in each of the repositories
  - Open the repository folder in 2 separate windows and run the below command,
      ```sh
      $ ann -t . -s ara-archiver -n remote1 -k ~/.ara/keyrings/ara-archiver -i <did>  // in 'ara-network-node-identity-archiver'
      $ ann -t . -s ara-resolver -n remote2 -k ~/.ara/keyrings/ara-resolver -i <did>  // in 'ara-network-node-identity-resolver'
      ```
- To communicate with the [Ara privatenet blockchain](https://github.com/AraBlocks/ara-privatenet) and deploy an AFS proxy, you must be running a local geth node.

### Creating an ARA Identity

Run the create command found in ARA identity.

```sh
$ aid create
```

> **Important**: Do not lose your password and mnemonic as your account cannot be recovered without them.

Then, archive the identity.

```sh
$ aid archive <did> -s ara-archiver -n remote1 -k ~/.ara/keyrings/ara-archiver.pub
```

If you successfully archived the identity, you should be able to resolve it:

```sh
$ aid resolve <did> -s ara-resolver -n remote2 -k ~/.ara/keyrings/ara-resolver.pub --cache==false
```

### Creating an AFS

To create an AFS, you can run the create command along with providing a valid owner identity.

```sh
$ afs create did:ara:df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
```

Upon successful creation, a new identity will be outputted for this AFS. Store the mnemonic phrase in a safe place as it is the only recovery mechanism for your AFS.

> **Note**: The `did:ara:` prefix is optional for all commands.

### Adding to an AFS

Adding files and/or directories can be done with the `add` command.

```sh
$ afs add <did> <pathspec...>
```

Example:

```sh
$ afs add df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 my_video.mp4
```

### Removing from an AFS

Removing files and/or directories if very similar to adding them.

```sh
$ afs remove <did> <pathspec...>
```

Example:

```sh
$ afs remove df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 my_video.mp4
```

### Committing an AFS

Every change you make is saved to a local file on disc, you can think of these as staged commits. Before your changes are published to the ARA network and become discoverable, you have to commit them. You can commit with the `commit` command.

```sh
$ afs commit df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9
```

### Pricing an AFS

To set the price of an AFS, run the `set-price` command with the AFS identity.

```sh
$ afs set-price df45010fee8baf67f91f5102b9562b14d5b49c972a007cd460b1aa77fd90eaf9 10 // sets the price of the AFS to 10 ara tokens
```

To verify that the price was set:

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

### `async create(opts)` <a name="create"></a>

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
const did = 
const { afs } = await create({ did, password })
```

### `async destroy(opts)` <a name="destroy"></a>

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

### `async add(opts)` <a name="add"></a>

> **Stability: 2** Stable

Adds one or more files to an existing `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to add files to
  - `password` - The password of the owner of this `AFS`
  - `force` - Force add the path(s)
  - `paths` - The path(s) of the files to add

```js
const { afs, mnemonic } = await create({ owner, password })
const { did } = afs
const paths = ['./index.js', './add.js', './picture.png']
afs = await add({
  did,
  paths,
  password
})
```

### `async remove(opts)` <a name="remove"></a>

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

### `async commit(opts)` <a name="commit"></a>

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

### `async estimateCommitGasCost(opts)` <a name="estimatecommit"></a>

> **Stability: 2** Stable

Estimates the cost (in ETH) of committing an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to commit
  - `password` - The password of the owner of this `AFS`

```js
const cost = await estimateCommitGasCost({
  did,
  password
})
```

### `async setPrice(opts)` <a name="setprice"></a>

> **Stability: 2** Stable

Sets the price in Ara tokens of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to set the price of
  - `password` - The password of the owner of this `AFS`
  - `price` - The price in Ara tokens to set this `AFS`

```js
const price = 10
await setPrice({
  did,
  password,
  price
})
```

### `async getPrice(opts)` <a name="getprice"></a>

> **Stability: 2** Stable

Gets the price in Ara tokens of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to get the price of

```js
const price = await getPrice({ did })
```

### `async estimateSetPriceGasCost(opts)` <a name="estimateprice"></a>

> **Stability: 2** Stable

Estimates the cost (in ETH) of setting the price of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` to set the price of
  - `password` - The password of the owner of this `AFS`
  - `price` - The price in Ara tokens to set this `AFS`

```js
const cost = await estimateSetPriceGasCost({ did, password })
```

### `async unarchive(opts)` <a name="unarchive"></a>

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

### `async metadata.writeFile(opts)` <a name="writefile"></a>

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

### `async metadata.writeKey(opts)` <a name="writekey"></a>

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

### `async metadata.readKey(opts)` <a name="readkey"></a>

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

### `async metadata.delKey(opts)` <a name="delkey"></a>

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

### `async metadata.clear(opts)` <a name="clear"></a>

> **Stability: 2** Stable

Empties all metadata contents of an `AFS`.

- `opts`
  - `did` - The `DID` of the `AFS` whose metadata is to be emptied

```js
await afs.metadata.clear({ did })
```

### `async metadata.readFile(opts)` <a name="readfile"></a>

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
