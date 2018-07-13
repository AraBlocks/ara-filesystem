<img src="https://github.com/AraBlocks/docs/blob/master/ara.png" width="30" height="30" /> ara-filesystem
========
![](https://travis-ci.com/AraBlocks/ara-filesystem.svg?token=93ySMW14xn3tP6eZMEza&branch=master)

The Ara FileSystem, isolated and secure file systems backed by ARA identities.

## Status

This project is still in alpha development.

> **Important**: While this project is under active development, run `npm link` in `ara-filesystem` directory with `ara-identity`, `ara-network`, `ara-network-node-identity-archiver`, and `ara-network-node-identity-resolver` cloned locally. 

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
  - `ara-network`
  - `ara-network-node-identity-archiver`
  - `ara-network-node-identity-resolver`
- Be sure to `npm install` and `npm link` for each
- Test the CLI by running the following commands,
  - `$ aid --help`
  - `$ ann --help`
  - `$ ans --help`

- Generate secrets for both the Archiver & Resolver nodes
  - `$ ans -k archiver  // Generating secrets for the archiver node`
  - `$ ans -k resolver  // Generating secrets for the resolver node`

- Once the secrets are generated, the Archiver & Resolver Network nodes can be started.
  - Be sure to have cloned the [archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver) and [resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver) repositories
  - Ensure you have ran `npm install` in each of the repositories
  - Open the repository folder in 2 separate windows and run the below command,
      ```sh
      $ ann -t . -k archiver  // in 'ara-network-node-identity-archiver'
      $ ann -t . -k resolver  // in 'ara-network-node-identity-resolver'
      ```
- To communicate with the Ethereum blockchain and commit your AFS changes, you must be running a local blockchain. Run:
  - `$ truffle develop`
- The contracts will have to be compiled and deployed to this local blockchain as well by running, once the `truffle` console has been opened run:
  - ` $ migrate`
    - **Note**: If `migrate` fails, try deleting the `build/contracts` directory and try again.
- Since the address of `Storage.sol` is currently hardcoded, the address that `migrate` deploys to will need to be copied and pasted into `kStorageAddress` in `constants.js`.


### Creating an ARA Identity

Run the create command found in ARA identity.

```sh
$ aid create --archive -k archiver
```

The `archive` flag will automatically archive the identity after creation. This command will return the DID of the identity created, this will be used to create an AFS.

> **Important**: Do not lose your password as your account cannot be recovered.

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

Removing files and/or directories if very siilar to adding them.

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

## API

TODO

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
