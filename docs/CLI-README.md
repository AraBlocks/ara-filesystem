 ### afs(1)

#### Abstract

All other commands prepended with `afs-` execute as a child of this command

#### Usage

```sh
usage: afs: [-hDV] [--help] [--version]
[--debug] <command> [<args>]
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show this message||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|-filesystem, -D, --debug||:*')|
|-s, --secret|Shared secret for the keyring||
|-n, --network|Network name of the key for the DID resolver in the keyring [string]||



---
 ### afs-create(1)

#### Abstract

Create a new AFS

#### Usage

```sh
afs-create <owner>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|--an, --archiver|Network name of the key for the DID archiver in the keyring [string]||
|-q, --quiet|Only output errors and results [string]||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|owner|This AFS owner's ARA decentralized identity (did) URI|string|




---
 ### afs-add(1)

#### Abstract

Adds file(s) and/or directories to an AFS

#### Usage

```sh
afs-add <did> <pathspec...>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|
|pathspec|The file(s) you wish to add to AFS|string|




---
 ### afs-remove(1)

#### Abstract

Removes file(s) and/or directores from an AFS

#### Usage

```sh
afs-remove <did> <pathspec...>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|
|pathspec|The file(s) you wish to remove from AFS|string|




---
 ### afs-commit(1)

#### Abstract

Publishes an AFS to the network

#### Usage

```sh
afs-commit <did>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|-P, --price|Price (in ARA) to set the cost of the AFS||
|-f, --force|Force commit operation||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|




---
 ### afs-history(1)

#### Abstract

Prints AFS history

#### Usage

```sh
afs-history <did>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|




---
 ### afs-price(1)

#### Abstract

Sets, gets the price (in ARA) of an AFS

#### Usage

```sh
usage: afs price: [-h] [--help] [options] [--] <command>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Subcommands
| Subcommand | Description |
|--|--|
|afs-price set|Publish price for the given AFS|
|afs-price get|Return the price for a given AFS|


 ### afs-price set(1)

#### Abstract

Publish price for the given AFS

#### Usage

```sh
afs-price set <did> [price]
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|-f, --force|Force set price operation||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|
|price|Cost associated with an AFS (in ARA)|number|




 ### afs-price get(1)

#### Abstract

Return the price for a given AFS

#### Usage

```sh
afs-price get <did>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|




---
 ### afs-destroy(1)

#### Abstract

Removes an AFS from the network

#### Usage

```sh
afs-destroy <did>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|-f, --force|Force destroy operation||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|




---
 ### afs-unarchive(1)

#### Abstract

Unarchive an AFS to a directory

#### Usage

```sh
afs-unarchive <did> [pathspec]
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|
|pathspec|The path where the AFS should be extracted.|string|




---
 ### afs-metadata(1)

#### Abstract

CRUD operation interface for an AFS' metadata

#### Usage

```sh
usage: afs metadata: [-h] [--help] [options] [--] <command>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Subcommands
| Subcommand | Description |
|--|--|
|afs-metadata write-key|Write a key-value pair to the AFS'|
|afs-metadata read-key|Read a key's value from AFS metadata|
|afs-metadata delete-key|Delete a key-value pair from the|
|afs-metadata clear|Clears all metadata from an AFS|
|afs-metadata print|Prints current metadata for an AFS|
|afs-metadata write-file|Writes contents of entire file to|


 ### afs-metadata write-key(1)

#### Abstract

Write a key-value pair to the AFS'

#### Usage

```sh
afs-metadata write-key <did> <key> <value>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|-p, --print|Print full metadata after write||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|
|key|The key to write|string|
|value|The value to write|string|




 ### afs-metadata read-key(1)

#### Abstract

Read a key's value from AFS metadata

#### Usage

```sh
afs-metadata read-key <did> <key>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|
|key|The key to write|string|




 ### afs-metadata delete-key(1)

#### Abstract

Delete a key-value pair from the

#### Usage

```sh
afs-metadata delete-key <did> <key>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|-p, --print|Print full metadata after delete||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|
|key|The key to write|string|




 ### afs-metadata clear(1)

#### Abstract

Clears all metadata from an AFS

#### Usage

```sh
afs-metadata clear <did>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|




 ### afs-metadata print(1)

#### Abstract

Prints current metadata for an AFS

#### Usage

```sh
afs-metadata print <did>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|




 ### afs-metadata write-file(1)

#### Abstract

Writes contents of entire file to

#### Usage

```sh
afs-metadata write-file <did> <filepath>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|




---
 ### afs-ownership(1)

#### Abstract

Ownership management of an AFS

#### Usage

```sh
usage: afs ownership: [-h] [--help] [options] [--] <command>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Subcommands
| Subcommand | Description |
|--|--|
|afs-ownership request|Requests ownership of an AFS|
|afs-ownership revoke|Revokes a previous request for|
|afs-ownership approve|Approves an ownership transfer|
|afs-ownership claim|Claim an AFS' identity|


 ### afs-ownership request(1)

#### Abstract

Requests ownership of an AFS

#### Usage

```sh
afs-ownership request <requesterDid> <contentDid>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|requester-did|DID of the requester|string|
|content-did|An AFS ARA decentralized identity (did) URI|string|




 ### afs-ownership revoke(1)

#### Abstract

Revokes a previous request for

#### Usage

```sh
afs-ownership revoke <requesterDid> <contentDid>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|requester-did|DID of the requester|string|
|content-did|An AFS ARA decentralized identity (did) URI|string|




 ### afs-ownership approve(1)

#### Abstract

Approves an ownership transfer

#### Usage

```sh
afs-ownership approve <contentDid> <newOwnerDid>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|content-did|An AFS ARA decentralized identity (did) URI|string|
|new-owner-did|DID to transfer ownership to|string|




 ### afs-ownership claim(1)

#### Abstract

Claim an AFS' identity

#### Usage

```sh
afs-ownership claim <contentDid>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|content-did|An AFS ARA decentralized identity (did) URI|string|




---
 ### afs-deploy(1)

#### Abstract

Deploy an AFS proxy to the network

#### Usage

```sh
afs-deploy <did>
```

#### Options
| Flag(s) | Description | Type |
|--|--|--|
|-h, --help|Show help||
|-V, --version|Show AFS CLI version||
|-v, --verbose|Show verbose output||
|-f, --force|Force deploy operation||


#### Positionals
| Flag(s) | Description | Type |
|--|--|--|
|did|An AFS ARA decentralized identity (did) URI|string|



