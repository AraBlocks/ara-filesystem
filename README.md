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
### Prerequisites

- Clone the repositories listed above
- Be sure to `npm install` and `npm link` for each
- Test the CLI by running the following commands,
```sh
$ aid --help
$ ann --help
$ ans --help
```
- The above commands should display the help options for each of the CLIs

Generate secrets for both the Archiver & Resolver nodes

- `$ ans -k ${network_key_string}`

- Example:
```sh
$ ans -k archiver // Generating secrets for the archiver node
$ ans -k resolver // Generating secrets for the resolver node
```

Once the secrets are generated, the Archiver & Resolver Network nodes can be started.

  - Clone the [archiver](https://github.com/AraBlocks/ara-network-node-identity-archiver) and [resolver](https://github.com/AraBlocks/ara-network-node-identity-resolver) repositories
  - Do `npm install` in each of the repositories
  - Open the repository folder in 2 separate windows and run the below command,
    - `$ ann -t . -k ${network_key_string}`

    - Example:
      ```sh
      $ ann -t . -k archiver // starting the archiver network node
      $ ann -t . -k resolver // starting the resolver network node
      ```

Note : Make sure to use different `network_key_string` for the Archiver & Resolver Network Nodes

To communicate with the Ethereum blockchain and commit your AFS changes, you must be running a local blockchain. You can do so by running the following,

```sh
  $ truffle develop
```

The contracts will have to be compiled and deployed to this local blockchain as well by running,

```sh
  $ migrate
```

once the `truffle` console has been opened.

Since the address of `Storage.sol` is currently hardcoded, the address that `migrate` deploys to will need to be copied and pasted into `kStorageAddress` in `constants.js`.

> **Note**: If `migrate` fails, try deleting the `build/contracts` directory and try again.

### Creating an ARA Identity

TODO

### Creating an AFS

TODO

### Adding to an AFS

TODO

### Removing from an AFS

TODO

### Committing an AFS

TODO

## API

TODO

## Contributing
- [Commit message format](https://github.com/AraBlocks/docs/blob/master/.github/COMMIT_FORMAT.md)
- [commit message examples](https://github.com/AraBlocks/docs/blob/master/.github/COMMIT_FORMAT_EXAMPLES.md)
- [How to contribute](https://github.com/AraBlocks/docs/blob/master/.github/CONTRIBUTING.md)

Releases follow [Semantic Versioning](https://semver.org/)

## See Also

- [Truffle](https://github.com/trufflesuite/truffle)
- [ARA Identity](https://github.com/AraBlocks/ara-identity)

## License
LGPL-3.0
