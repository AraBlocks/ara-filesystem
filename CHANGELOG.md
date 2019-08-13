## [0.27.1](https://github.com/AraBlocks/ara-filesystem/compare/0.22.1...0.27.1) (2019-08-13)


### Bug Fixes

* ararc ([f864b5f](https://github.com/AraBlocks/ara-filesystem/commit/f864b5f))
* only check price is same if not estimate ([7dd63fa](https://github.com/AraBlocks/ara-filesystem/commit/7dd63fa))
* price estimateDid would always throw without deployed did ([44997df](https://github.com/AraBlocks/ara-filesystem/commit/44997df))
* silence lint ([062432d](https://github.com/AraBlocks/ara-filesystem/commit/062432d))
* switch rc to local ([7a1c613](https://github.com/AraBlocks/ara-filesystem/commit/7a1c613))


### Features

* allow pass in estimateDid ([6798f83](https://github.com/AraBlocks/ara-filesystem/commit/6798f83))



## [0.22.1](https://github.com/AraBlocks/ara-filesystem/compare/0.14.0...0.22.1) (2019-01-10)


### Bug Fixes

* **bin/:** Remove `.strict()` from cli args ([2e11356](https://github.com/AraBlocks/ara-filesystem/commit/2e11356))
* **bin/afs-metadata:** Define password ([20ab6be](https://github.com/AraBlocks/ara-filesystem/commit/20ab6be))
* accidentally pushed files ([9a33a84](https://github.com/AraBlocks/ara-filesystem/commit/9a33a84))
* add help(false) back to fix shipright ([49fa8f3](https://github.com/AraBlocks/ara-filesystem/commit/49fa8f3))
* add id to test fixtures ([7e5b90e](https://github.com/AraBlocks/ara-filesystem/commit/7e5b90e))
* cli global options ([8f0fd16](https://github.com/AraBlocks/ara-filesystem/commit/8f0fd16))
* dont mkdirp ignored path ([e276702](https://github.com/AraBlocks/ara-filesystem/commit/e276702))
* lint ([1ac80e5](https://github.com/AraBlocks/ara-filesystem/commit/1ac80e5))
* lint ([4bf9b56](https://github.com/AraBlocks/ara-filesystem/commit/4bf9b56))
* lint ([2f85d51](https://github.com/AraBlocks/ara-filesystem/commit/2f85d51))
* lint ([aa12db9](https://github.com/AraBlocks/ara-filesystem/commit/aa12db9))
* pass in afsPassword ([7c9b219](https://github.com/AraBlocks/ara-filesystem/commit/7c9b219))
* typo ([7048059](https://github.com/AraBlocks/ara-filesystem/commit/7048059))
* update test constants ([4d7654a](https://github.com/AraBlocks/ara-filesystem/commit/4d7654a))
* upgrade ignore dep and make relevant changes ([1c79c33](https://github.com/AraBlocks/ara-filesystem/commit/1c79c33))
* wording ([33c8afd](https://github.com/AraBlocks/ara-filesystem/commit/33c8afd))
* **add.js:** fix paths as string causing unncessary add ([ff69080](https://github.com/AraBlocks/ara-filesystem/commit/ff69080))
* **commit.js:** remove sizes from buffer data ([8e81d46](https://github.com/AraBlocks/ara-filesystem/commit/8e81d46))
* **metadata.js:** fix writeFile overwriting existing keys ([7ffe03e](https://github.com/AraBlocks/ara-filesystem/commit/7ffe03e))
* **scripts/test:** enable ganache quiet ([525a470](https://github.com/AraBlocks/ara-filesystem/commit/525a470))
* **scripts/travis-install:** downgrade truffle install version ([e08b2aa](https://github.com/AraBlocks/ara-filesystem/commit/e08b2aa))


### Features

* **bin/:** Add password, afsPassword, & mnemonic args ([9609919](https://github.com/AraBlocks/ara-filesystem/commit/9609919))
* **bin/afs-create:** password flag for integration tests ([ee69e14](https://github.com/AraBlocks/ara-filesystem/commit/ee69e14))
* afs passwords work ([1e3cbea](https://github.com/AraBlocks/ara-filesystem/commit/1e3cbea))
* wip ([84ad8f3](https://github.com/AraBlocks/ara-filesystem/commit/84ad8f3))



# [0.14.0](https://github.com/AraBlocks/ara-filesystem/compare/0.12.0...0.14.0) (2018-12-12)


### Bug Fixes

* **scripts/test:** add back in all tests ([c0a3831](https://github.com/AraBlocks/ara-filesystem/commit/c0a3831))
* **test/_util.js:** add getIdentifier check to mirrorIdentity ([e01ea6d](https://github.com/AraBlocks/ara-filesystem/commit/e01ea6d))
* add network.identity ararc config ([c16dc86](https://github.com/AraBlocks/ara-filesystem/commit/c16dc86))
* fix typo in test, revert to all tests ([7600d7b](https://github.com/AraBlocks/ara-filesystem/commit/7600d7b))
* test cleanup and fix typo ([da0db13](https://github.com/AraBlocks/ara-filesystem/commit/da0db13))



# [0.12.0](https://github.com/AraBlocks/ara-filesystem/compare/0.6.0...0.12.0) (2018-12-10)


### Bug Fixes

* **metadata:** return empty object when no metadata ([46d4f2d](https://github.com/AraBlocks/ara-filesystem/commit/46d4f2d))
* **npmignore:** re-add bin and lib ([bb228b9](https://github.com/AraBlocks/ara-filesystem/commit/bb228b9))
* **util:** close afs after check update ([1a9a383](https://github.com/AraBlocks/ara-filesystem/commit/1a9a383))
* remove deploy from test script ([5a3b8a8](https://github.com/AraBlocks/ara-filesystem/commit/5a3b8a8))
* remove test specifier ([0849734](https://github.com/AraBlocks/ara-filesystem/commit/0849734))
* tests ([2d0b93b](https://github.com/AraBlocks/ara-filesystem/commit/2d0b93b))



# [0.6.0](https://github.com/AraBlocks/ara-filesystem/compare/0.5.7...0.6.0) (2018-11-20)


### Features

* checking afs update available wip ([9b9edf9](https://github.com/AraBlocks/ara-filesystem/commit/9b9edf9))
* show help if command provided is not valid ([16bbba2](https://github.com/AraBlocks/ara-filesystem/commit/16bbba2))



## [0.5.7](https://github.com/AraBlocks/ara-filesystem/compare/0.2.13...0.5.7) (2018-11-20)


### Bug Fixes

* **test/destroy.js:** remove old test ([6f7f0a0](https://github.com/AraBlocks/ara-filesystem/commit/6f7f0a0))
* **test/destroy.js:** remove rest of old test ([684a965](https://github.com/AraBlocks/ara-filesystem/commit/684a965))
* fix commit tests ([ed1de7e](https://github.com/AraBlocks/ara-filesystem/commit/ed1de7e))
* fix tests wip ([0a9ab40](https://github.com/AraBlocks/ara-filesystem/commit/0a9ab40))
* **metadata:** close afs after metadata read/write ([976af08](https://github.com/AraBlocks/ara-filesystem/commit/976af08))
* **package.json:** Bump ara-context to 0.4.x ([685218d](https://github.com/AraBlocks/ara-filesystem/commit/685218d)), closes [AraBlocks/ara-context#9](https://github.com/AraBlocks/ara-context/issues/9)
* **scripts/test:** revert commented out ganache ([d6133ee](https://github.com/AraBlocks/ara-filesystem/commit/d6133ee))
* use contracts storage for commit ([a89dfe9](https://github.com/AraBlocks/ara-filesystem/commit/a89dfe9))


### Features

* added shipright to version hook ([b27512b](https://github.com/AraBlocks/ara-filesystem/commit/b27512b))
* **create:** Regenerate etc partition from key in DDO ([8c82cc3](https://github.com/AraBlocks/ara-filesystem/commit/8c82cc3))
* separate deploy from commit ([ea99d9e](https://github.com/AraBlocks/ara-filesystem/commit/ea99d9e))
* **metadata:** writeKeys to allow for multiple key writes ([3c049d4](https://github.com/AraBlocks/ara-filesystem/commit/3c049d4))
* use updated contracts storage ([77119a8](https://github.com/AraBlocks/ara-filesystem/commit/77119a8))



## [0.2.13](https://github.com/AraBlocks/ara-filesystem/compare/0.2.7...0.2.13) (2018-11-05)



## [0.2.7](https://github.com/AraBlocks/ara-filesystem/compare/0.2.6...0.2.7) (2018-10-26)


### Bug Fixes

* **create.js:** remove duplicate buffer creation ([843c8b2](https://github.com/AraBlocks/ara-filesystem/commit/843c8b2))



## [0.2.6](https://github.com/AraBlocks/ara-filesystem/compare/0.2.5...0.2.6) (2018-10-25)


### Bug Fixes

* pw requirement for editting AFS metadata ([442f74f](https://github.com/AraBlocks/ara-filesystem/commit/442f74f))



## [0.2.5](https://github.com/AraBlocks/ara-filesystem/compare/0.2.4...0.2.5) (2018-10-25)



## [0.2.4](https://github.com/AraBlocks/ara-filesystem/compare/0.2.3...0.2.4) (2018-10-25)


### Bug Fixes

* **price.js:** check current price before overwriting ([6da9882](https://github.com/AraBlocks/ara-filesystem/commit/6da9882))



## [0.2.3](https://github.com/AraBlocks/ara-filesystem/compare/0.2.2...0.2.3) (2018-10-23)



## [0.2.2](https://github.com/AraBlocks/ara-filesystem/compare/0.1.1...0.2.2) (2018-10-17)


### Bug Fixes

* **.travis.yml:** Cat npm debug logs instead of cp ([0ccf23d](https://github.com/AraBlocks/ara-filesystem/commit/0ccf23d))
* cli destructure ([18bc576](https://github.com/AraBlocks/ara-filesystem/commit/18bc576))
* **bin/ara-filesystem:** name => network ([96aea86](https://github.com/AraBlocks/ara-filesystem/commit/96aea86))
* Get create and add working again ([746652b](https://github.com/AraBlocks/ara-filesystem/commit/746652b))
* **create:** Fix scoping issue ([c1edcd3](https://github.com/AraBlocks/ara-filesystem/commit/c1edcd3))
* Fix issue with afs creation ([dfeecdb](https://github.com/AraBlocks/ara-filesystem/commit/dfeecdb))



## [0.1.1](https://github.com/AraBlocks/ara-filesystem/compare/0.1.0...0.1.1) (2018-09-21)


### Bug Fixes

* revert commit refactor ([c5f3cf3](https://github.com/AraBlocks/ara-filesystem/commit/c5f3cf3))
* rm local test script cmds ([f6e9f11](https://github.com/AraBlocks/ara-filesystem/commit/f6e9f11))
* test script ([d1f1485](https://github.com/AraBlocks/ara-filesystem/commit/d1f1485))
* up gaslimit ([6df14c8](https://github.com/AraBlocks/ara-filesystem/commit/6df14c8))
* **scipts/test:** migrate cp to mv ([283c107](https://github.com/AraBlocks/ara-filesystem/commit/283c107))
* **scripts/test:** fix typo ([c71d606](https://github.com/AraBlocks/ara-filesystem/commit/c71d606))
* **scripts/test:** im an idiot ([b011d2c](https://github.com/AraBlocks/ara-filesystem/commit/b011d2c))
* **scripts/test:** revert mv back to cp ([fb3dfb9](https://github.com/AraBlocks/ara-filesystem/commit/fb3dfb9))
* commit ([3ad4748](https://github.com/AraBlocks/ara-filesystem/commit/3ad4748))


### Features

* changelog setup ([51010f7](https://github.com/AraBlocks/ara-filesystem/commit/51010f7))
* **aid:** pass in keyringOpts to validate ([#101](https://github.com/AraBlocks/ara-filesystem/issues/101)) ([c74bec7](https://github.com/AraBlocks/ara-filesystem/commit/c74bec7))



# [0.1.0](https://github.com/AraBlocks/ara-filesystem/compare/0d34b2c...0.1.0) (2018-09-13)


### Bug Fixes

* :( ([31186cf](https://github.com/AraBlocks/ara-filesystem/commit/31186cf))
* **price.js:** convert token amount for afs price ([78ac274](https://github.com/AraBlocks/ara-filesystem/commit/78ac274))
* add destructure ([b2ea6c9](https://github.com/AraBlocks/ara-filesystem/commit/b2ea6c9))
* args come from opts ([3f807d9](https://github.com/AraBlocks/ara-filesystem/commit/3f807d9))
* bugs ([df047e0](https://github.com/AraBlocks/ara-filesystem/commit/df047e0))
* change throw to debug ([c6733f9](https://github.com/AraBlocks/ara-filesystem/commit/c6733f9))
* im an idiot ([9daea9e](https://github.com/AraBlocks/ara-filesystem/commit/9daea9e))
* missed a type check ([a9c8b66](https://github.com/AraBlocks/ara-filesystem/commit/a9c8b66))
* only be able to modify content storage ([cdcdac8](https://github.com/AraBlocks/ara-filesystem/commit/cdcdac8))
* optimize append and write ([57a20df](https://github.com/AraBlocks/ara-filesystem/commit/57a20df))
* password rqmt in create ([3b29626](https://github.com/AraBlocks/ara-filesystem/commit/3b29626))
* residual bugs ([b2c3469](https://github.com/AraBlocks/ara-filesystem/commit/b2c3469))
* type error check ([05dc67f](https://github.com/AraBlocks/ara-filesystem/commit/05dc67f))
* **.eslintrc:** fix typo ([e518b12](https://github.com/AraBlocks/ara-filesystem/commit/e518b12))
* **.gitignore:** add generated CFSs to gitignore ([673d58e](https://github.com/AraBlocks/ara-filesystem/commit/673d58e))
* **.travis.yml:** setup travis to call bash scripts ([7a72eed](https://github.com/AraBlocks/ara-filesystem/commit/7a72eed))
* **add.js:** remove duplicate mirror declaration ([12e0f6e](https://github.com/AraBlocks/ara-filesystem/commit/12e0f6e))
* **aid, create:** fix double hash for afs mnemonic and resolve afs owner did remotely ([37ef245](https://github.com/AraBlocks/ara-filesystem/commit/37ef245))
* **aid.js:** Use logical operator for each key, not whole opts object ([6c978e4](https://github.com/AraBlocks/ara-filesystem/commit/6c978e4))
* **bin/ara-filesystem:** Add price arg to estimate gas func in onsetprice ([1f2c942](https://github.com/AraBlocks/ara-filesystem/commit/1f2c942))
* **bin/ara-filesystem:** change passphrase request text ([1ac0641](https://github.com/AraBlocks/ara-filesystem/commit/1ac0641))
* **bin/ara-filesystem:** Rename opts to keyringOpts ([fdea4e2](https://github.com/AraBlocks/ara-filesystem/commit/fdea4e2))
* **bin/install-afs:** Add missing repo ([e8e9e19](https://github.com/AraBlocks/ara-filesystem/commit/e8e9e19))
* **bin/test:** remove cd to fix path resolution for constants.js ([fd79a98](https://github.com/AraBlocks/ara-filesystem/commit/fd79a98))
* **bin/test:** remove testrunner for now ([7d4a5a5](https://github.com/AraBlocks/ara-filesystem/commit/7d4a5a5))
* **commit.js:** raise gas limit for writeAll ([6ffb6da](https://github.com/AraBlocks/ara-filesystem/commit/6ffb6da))
* **commit.js:** replace old util function ([cd0177a](https://github.com/AraBlocks/ara-filesystem/commit/cd0177a))
* **index.js:** get travis working ([4a4fb6c](https://github.com/AraBlocks/ara-filesystem/commit/4a4fb6c))
* **package.json:** add ara-identity to dependencies ([cc5734a](https://github.com/AraBlocks/ara-filesystem/commit/cc5734a))
* **package.json:** Bump ld-cryptosuite-registry ([ee0a070](https://github.com/AraBlocks/ara-filesystem/commit/ee0a070))
* don't use object const ([8a3e544](https://github.com/AraBlocks/ara-filesystem/commit/8a3e544))
* linting and fixing tests to match new identity creation ([2fede72](https://github.com/AraBlocks/ara-filesystem/commit/2fede72))
* make all paths unix-based ([f244040](https://github.com/AraBlocks/ara-filesystem/commit/f244040))
* make linter stfu ([efb28f7](https://github.com/AraBlocks/ara-filesystem/commit/efb28f7))
* move scripts to scripts/ ([dc88802](https://github.com/AraBlocks/ara-filesystem/commit/dc88802))
* remove overwrite, migrate to afs.HOME ([7ba3d04](https://github.com/AraBlocks/ara-filesystem/commit/7ba3d04))
* remove password requirement for unarchive ([1cd4dd1](https://github.com/AraBlocks/ara-filesystem/commit/1cd4dd1))
* undo optional path ([#39](https://github.com/AraBlocks/ara-filesystem/issues/39)) ([ca4d3ca](https://github.com/AraBlocks/ara-filesystem/commit/ca4d3ca))
* use original mnemonic to regenerate AFS identity ([33c2f1f](https://github.com/AraBlocks/ara-filesystem/commit/33c2f1f))
* **commit.js:** making travis happy ([46cfb4a](https://github.com/AraBlocks/ara-filesystem/commit/46cfb4a))
* **contracts/Storage.sol:** fire commit event in write ([efd087b](https://github.com/AraBlocks/ara-filesystem/commit/efd087b))
* **create.js:** fix merge conflicts ([97e66b1](https://github.com/AraBlocks/ara-filesystem/commit/97e66b1))
* **package.json:** add eslint config ([a771be1](https://github.com/AraBlocks/ara-filesystem/commit/a771be1))
* **README.md:** fix broken contribution links ([0d34b2c](https://github.com/AraBlocks/ara-filesystem/commit/0d34b2c))
* **test/*:** correct failing tests ([598a8bc](https://github.com/AraBlocks/ara-filesystem/commit/598a8bc))
* **util.js:** linting ([d35a9a9](https://github.com/AraBlocks/ara-filesystem/commit/d35a9a9))
* adhere to linter ([b5dc58c](https://github.com/AraBlocks/ara-filesystem/commit/b5dc58c))
* use outside module for checking DID method ([02bdfa3](https://github.com/AraBlocks/ara-filesystem/commit/02bdfa3))
* **key-path:** Fix afs create issue on fresh install ([89b24ec](https://github.com/AraBlocks/ara-filesystem/commit/89b24ec))
* **test/aid.js:** make tests serial so they pass ([3ff9099](https://github.com/AraBlocks/ara-filesystem/commit/3ff9099))
* change price to uint16 and encapsulate did, password validation ([c1c36e9](https://github.com/AraBlocks/ara-filesystem/commit/c1c36e9))
* eslint update and cleanup ([85a4f85](https://github.com/AraBlocks/ara-filesystem/commit/85a4f85))
* forgot untracked files ([2ab5ac1](https://github.com/AraBlocks/ara-filesystem/commit/2ab5ac1))
* move truffle to top level ([7b328df](https://github.com/AraBlocks/ara-filesystem/commit/7b328df))
* remove cfs files ([0175388](https://github.com/AraBlocks/ara-filesystem/commit/0175388))
* use require instead of if for storage modifier ([#16](https://github.com/AraBlocks/ara-filesystem/issues/16)) ([71aeff8](https://github.com/AraBlocks/ara-filesystem/commit/71aeff8))
* use SafeMath in Storage for key add ([0cb75fc](https://github.com/AraBlocks/ara-filesystem/commit/0cb75fc))
* **contracts/Storage.sol:** change uint to uint256 ([83c04b4](https://github.com/AraBlocks/ara-filesystem/commit/83c04b4))


### Features

* **bin/ara-filesystem:** Add cli opts for keyring, name, & secret ([1c79449](https://github.com/AraBlocks/ara-filesystem/commit/1c79449))
* **create.js:** Add opts arg to aid.archive ([5d0127b](https://github.com/AraBlocks/ara-filesystem/commit/5d0127b))
* ability to resolve local identities ([133c1ae](https://github.com/AraBlocks/ara-filesystem/commit/133c1ae))
* add, remove, history CLI commands; mnemonic phrase for AFS ID; resolve existing AFS; AFS tests ([9d8c579](https://github.com/AraBlocks/ara-filesystem/commit/9d8c579))
* added authentication property ([3fe29c3](https://github.com/AraBlocks/ara-filesystem/commit/3fe29c3))
* Allow for user to determine own AFS path ([b4af6f9](https://github.com/AraBlocks/ara-filesystem/commit/b4af6f9))
* apply ddo to afs obj ([940217e](https://github.com/AraBlocks/ara-filesystem/commit/940217e))
* archive and resolve AFS aid ([27e1487](https://github.com/AraBlocks/ara-filesystem/commit/27e1487))
* clear metadata entirely ([7a58645](https://github.com/AraBlocks/ara-filesystem/commit/7a58645))
* cli support for create ([141a646](https://github.com/AraBlocks/ara-filesystem/commit/141a646))
* commit both files in single write call ([5a87102](https://github.com/AraBlocks/ara-filesystem/commit/5a87102))
* configurable opts for archiving and resolving ([03c2828](https://github.com/AraBlocks/ara-filesystem/commit/03c2828))
* extend AFS to generate own keypath ([2e7540e](https://github.com/AraBlocks/ara-filesystem/commit/2e7540e))
* force option for destroy ([c5d6659](https://github.com/AraBlocks/ara-filesystem/commit/c5d6659))
* format DID uri ([913c211](https://github.com/AraBlocks/ara-filesystem/commit/913c211))
* gas price CLI estimations, offset overflow fix ([ef12ed1](https://github.com/AraBlocks/ara-filesystem/commit/ef12ed1))
* generic hash util ([5453fbc](https://github.com/AraBlocks/ara-filesystem/commit/5453fbc))
* ignore headers on append commits, optimize commit ([2cbf4ab](https://github.com/AraBlocks/ara-filesystem/commit/2cbf4ab))
* metadata support first pass ([8750dfe](https://github.com/AraBlocks/ara-filesystem/commit/8750dfe))
* metadata tests ([f1f70e5](https://github.com/AraBlocks/ara-filesystem/commit/f1f70e5))
* minimize writes during commit to 2 ([bad5227](https://github.com/AraBlocks/ara-filesystem/commit/bad5227))
* only commit metadata tree and sig ([deef331](https://github.com/AraBlocks/ara-filesystem/commit/deef331))
* optionally set price on commit ([1797774](https://github.com/AraBlocks/ara-filesystem/commit/1797774))
* remove password requirement for getPrice, migrate to ara cfsnet ([a6d862b](https://github.com/AraBlocks/ara-filesystem/commit/a6d862b))
* return afs instance from add/remove ([2e24385](https://github.com/AraBlocks/ara-filesystem/commit/2e24385))
* safety check in aid.create ([24a13cb](https://github.com/AraBlocks/ara-filesystem/commit/24a13cb))
* setting default afs path ([5ddc5e0](https://github.com/AraBlocks/ara-filesystem/commit/5ddc5e0))
* setup travis to integrate with truffle ([42501e4](https://github.com/AraBlocks/ara-filesystem/commit/42501e4))
* unarchive first pass ([d18496d](https://github.com/AraBlocks/ara-filesystem/commit/d18496d))
* validate password by decrypt keystore ([b67dad9](https://github.com/AraBlocks/ara-filesystem/commit/b67dad9))
* working unarchive ([04ebf7b](https://github.com/AraBlocks/ara-filesystem/commit/04ebf7b))
* working updated afs identity archiving ([196d4ad](https://github.com/AraBlocks/ara-filesystem/commit/196d4ad))
* write file to AFS metadata ([3fbed8d](https://github.com/AraBlocks/ara-filesystem/commit/3fbed8d))
* **{commit.js, constants.js}:** merge ([2403ba7](https://github.com/AraBlocks/ara-filesystem/commit/2403ba7))
* **aid.js, create.js:** pass authentication wip ([9b64e2d](https://github.com/AraBlocks/ara-filesystem/commit/9b64e2d))
* **bin/ara-filesystem:** add force functionality for gas price confirmations ([#38](https://github.com/AraBlocks/ara-filesystem/issues/38)) ([3c95b45](https://github.com/AraBlocks/ara-filesystem/commit/3c95b45))
* **create.js:** create AFS with custom storage ([b341bd6](https://github.com/AraBlocks/ara-filesystem/commit/b341bd6))



