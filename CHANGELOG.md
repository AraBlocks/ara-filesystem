## [0.27.4](https://github.com/AraBlocks/ara-filesystem/compare/0.22.1...0.27.4) (2019-12-18)


### Bug Fixes

* ararc ([f864b5f](https://github.com/AraBlocks/ara-filesystem/commit/f864b5f1cef908b77de116f25a0848315ddf522b))
* only check price is same if not estimate ([7dd63fa](https://github.com/AraBlocks/ara-filesystem/commit/7dd63faf96b8d42cf77b76e323ce19a42d8451aa))
* price estimateDid would always throw without deployed did ([44997df](https://github.com/AraBlocks/ara-filesystem/commit/44997df3e55bf513fa0fcc9a4831d41a6982340a))
* silence lint ([062432d](https://github.com/AraBlocks/ara-filesystem/commit/062432d774db00adc922f212cff69bb7a19323a4))
* switch rc to local ([5819d79](https://github.com/AraBlocks/ara-filesystem/commit/5819d79dd98b18cc1ead807194137a058eeec53b))


### Features

* allow pass in estimateDid ([6798f83](https://github.com/AraBlocks/ara-filesystem/commit/6798f83fd703bf9ce737964f48dfe55d5505ed60))
* support event callbacks ([ccf4d2f](https://github.com/AraBlocks/ara-filesystem/commit/ccf4d2f7d10aa9fddb25a23e906141c96523b3fc))
* support separate callbacks in commit ([663228d](https://github.com/AraBlocks/ara-filesystem/commit/663228d330939c6191d11edab7dff249b0f35e9a))



## [0.22.1](https://github.com/AraBlocks/ara-filesystem/compare/0.14.0...0.22.1) (2019-01-10)


### Bug Fixes

* **add.js:** fix paths as string causing unncessary add ([ff69080](https://github.com/AraBlocks/ara-filesystem/commit/ff6908014a9ebf35bbdf45ffa13b50329dcae510))
* **bin/:** Remove `.strict()` from cli args ([2e11356](https://github.com/AraBlocks/ara-filesystem/commit/2e1135694837cc65d7c416385d56576d18779a7c))
* accidentally pushed files ([9a33a84](https://github.com/AraBlocks/ara-filesystem/commit/9a33a8463068476047ee87e0d6f8d2c7a887a974))
* **bin/afs-metadata:** Define password ([20ab6be](https://github.com/AraBlocks/ara-filesystem/commit/20ab6be2d93fd1ec9ef286e4e1d5c9a043014c1f))
* **commit.js:** remove sizes from buffer data ([8e81d46](https://github.com/AraBlocks/ara-filesystem/commit/8e81d4628e097861537b54b9fc75fd29f0e0433e))
* **metadata.js:** fix writeFile overwriting existing keys ([7ffe03e](https://github.com/AraBlocks/ara-filesystem/commit/7ffe03e5f61d53edf46ab80b3f366bbc43808d0c))
* add id to test fixtures ([7e5b90e](https://github.com/AraBlocks/ara-filesystem/commit/7e5b90e800ef7d3913164796dd275610a3284bf9))
* **scripts/test:** enable ganache quiet ([525a470](https://github.com/AraBlocks/ara-filesystem/commit/525a4703c78e9e709a40370d1a13b547509cc9d1))
* add help(false) back to fix shipright ([49fa8f3](https://github.com/AraBlocks/ara-filesystem/commit/49fa8f35cb587fda558dfc401861dd0d189fcd91))
* cli global options ([8f0fd16](https://github.com/AraBlocks/ara-filesystem/commit/8f0fd16b222fc354d1c1ad9d8e11756127757cd8))
* dont mkdirp ignored path ([e276702](https://github.com/AraBlocks/ara-filesystem/commit/e276702829d3e7181c98744be155eaa6804470d4))
* lint ([4bf9b56](https://github.com/AraBlocks/ara-filesystem/commit/4bf9b56c2578f10d8780ed680fd70250e22b2318))
* lint ([1ac80e5](https://github.com/AraBlocks/ara-filesystem/commit/1ac80e5e199f6e06258341db97bdda6ed64cc8a6))
* lint ([aa12db9](https://github.com/AraBlocks/ara-filesystem/commit/aa12db9e7dc564503001aa4b53d408e660beeeb5))
* lint ([2f85d51](https://github.com/AraBlocks/ara-filesystem/commit/2f85d51290a21f1e87dc98e9b93cc1ee0bf7a0d3))
* pass in afsPassword ([7c9b219](https://github.com/AraBlocks/ara-filesystem/commit/7c9b219936db9e8f5521a0169fe9f6e991bb74a9))
* typo ([7048059](https://github.com/AraBlocks/ara-filesystem/commit/7048059472494edb3bf5252937647d19edca2465))
* update test constants ([4d7654a](https://github.com/AraBlocks/ara-filesystem/commit/4d7654a911f14209897c34493a24551714c0fe76))
* upgrade ignore dep and make relevant changes ([1c79c33](https://github.com/AraBlocks/ara-filesystem/commit/1c79c33043203f6980c2f8939e24c0e428190ace))
* wording ([33c8afd](https://github.com/AraBlocks/ara-filesystem/commit/33c8afd3c5347de3b56c1b0773dd16192dfe7946))
* **scripts/travis-install:** downgrade truffle install version ([e08b2aa](https://github.com/AraBlocks/ara-filesystem/commit/e08b2aa2a70e271403d8805c7af5166e4c3348c7))


### Features

* afs passwords work ([1e3cbea](https://github.com/AraBlocks/ara-filesystem/commit/1e3cbea57d0738d2809de12a0423a8f95f8fcaef))
* wip ([84ad8f3](https://github.com/AraBlocks/ara-filesystem/commit/84ad8f3f61d2e21cde89796bebe08989be27cc53))
* **bin/:** Add password, afsPassword, & mnemonic args ([9609919](https://github.com/AraBlocks/ara-filesystem/commit/9609919f1740dd1b2c931d836c15485587bc6681))
* **bin/afs-create:** password flag for integration tests ([ee69e14](https://github.com/AraBlocks/ara-filesystem/commit/ee69e1449b539e673799cf8bcec35a518521a055))



# [0.14.0](https://github.com/AraBlocks/ara-filesystem/compare/0.12.0...0.14.0) (2018-12-12)


### Bug Fixes

* add network.identity ararc config ([c16dc86](https://github.com/AraBlocks/ara-filesystem/commit/c16dc867fd8ecfa914c338ba44df547c2c322dca))
* fix typo in test, revert to all tests ([7600d7b](https://github.com/AraBlocks/ara-filesystem/commit/7600d7ba6a7d466bf657e3a69d441205d63c419c))
* test cleanup and fix typo ([da0db13](https://github.com/AraBlocks/ara-filesystem/commit/da0db13acd54e1aff84dbc8085ffbfa887fff104))
* **scripts/test:** add back in all tests ([c0a3831](https://github.com/AraBlocks/ara-filesystem/commit/c0a3831707e493083b4ab8de7f112d5de8af4452))
* **test/_util.js:** add getIdentifier check to mirrorIdentity ([e01ea6d](https://github.com/AraBlocks/ara-filesystem/commit/e01ea6dd539dae550b98823c9395f042c729e828))



# [0.12.0](https://github.com/AraBlocks/ara-filesystem/compare/0.6.0...0.12.0) (2018-12-10)


### Bug Fixes

* remove deploy from test script ([5a3b8a8](https://github.com/AraBlocks/ara-filesystem/commit/5a3b8a89f7f4ca43162e3f413f278bc0640bbcbf))
* remove test specifier ([0849734](https://github.com/AraBlocks/ara-filesystem/commit/084973452121fdbb60dec4615dc64bb333bdeba3))
* tests ([2d0b93b](https://github.com/AraBlocks/ara-filesystem/commit/2d0b93b042e2abcadfa41ebccebef9bc7f6d4cea))
* **metadata:** return empty object when no metadata ([46d4f2d](https://github.com/AraBlocks/ara-filesystem/commit/46d4f2d2a9a10877b6cbfe8cf3671508dbe46052))
* **npmignore:** re-add bin and lib ([bb228b9](https://github.com/AraBlocks/ara-filesystem/commit/bb228b95bd2a1d9597438cf6215e48fa6298bf25))
* **util:** close afs after check update ([1a9a383](https://github.com/AraBlocks/ara-filesystem/commit/1a9a3839d27f2659293f75e215d576e51f1f9209))



# [0.6.0](https://github.com/AraBlocks/ara-filesystem/compare/0.5.7...0.6.0) (2018-11-20)


### Features

* checking afs update available wip ([9b9edf9](https://github.com/AraBlocks/ara-filesystem/commit/9b9edf9d81926a2804859b1fcace7c16e707bd87))
* show help if command provided is not valid ([16bbba2](https://github.com/AraBlocks/ara-filesystem/commit/16bbba226cb8f965152af392a2f152ad4472d379))



## [0.5.7](https://github.com/AraBlocks/ara-filesystem/compare/0.2.13...0.5.7) (2018-11-20)


### Bug Fixes

* **metadata:** close afs after metadata read/write ([976af08](https://github.com/AraBlocks/ara-filesystem/commit/976af08aac8df48b3880a7f4c20e6a3c36807aa9))
* **package.json:** Bump ara-context to 0.4.x ([685218d](https://github.com/AraBlocks/ara-filesystem/commit/685218d5382db3c9c32da70d9ad13e4049d3cc70)), closes [AraBlocks/ara-context#9](https://github.com/AraBlocks/ara-context/issues/9)
* **scripts/test:** revert commented out ganache ([d6133ee](https://github.com/AraBlocks/ara-filesystem/commit/d6133ee6c7c3b9e449761112b11fa2935bdde02d))
* fix commit tests ([ed1de7e](https://github.com/AraBlocks/ara-filesystem/commit/ed1de7eff95273dd6963f0d3a3ab823c57474ce8))
* fix tests wip ([0a9ab40](https://github.com/AraBlocks/ara-filesystem/commit/0a9ab4055e8c8372f8d7fae86275c7366f128387))
* use contracts storage for commit ([a89dfe9](https://github.com/AraBlocks/ara-filesystem/commit/a89dfe980673e52d64a95303625643d270ec97d2))
* **test/destroy.js:** remove old test ([6f7f0a0](https://github.com/AraBlocks/ara-filesystem/commit/6f7f0a07c992027dd56550aa7b122fa0c5396637))
* **test/destroy.js:** remove rest of old test ([684a965](https://github.com/AraBlocks/ara-filesystem/commit/684a965208620d0e69818833298246a90184c3a3))


### Features

* **create:** Regenerate etc partition from key in DDO ([8c82cc3](https://github.com/AraBlocks/ara-filesystem/commit/8c82cc3829b5711dbaecd65238bc11221cb919e2))
* **metadata:** writeKeys to allow for multiple key writes ([3c049d4](https://github.com/AraBlocks/ara-filesystem/commit/3c049d40f6c03b1a944bea4b6a5359289a1fa577))
* added shipright to version hook ([b27512b](https://github.com/AraBlocks/ara-filesystem/commit/b27512bdaa1b7359f6b60f6e8f27074826cf34af))
* separate deploy from commit ([ea99d9e](https://github.com/AraBlocks/ara-filesystem/commit/ea99d9e02a584246b85df20702c8123f1e4176f9))
* use updated contracts storage ([77119a8](https://github.com/AraBlocks/ara-filesystem/commit/77119a8ac4f96bc6cdc13909da217ef14ab384e1))



## [0.2.13](https://github.com/AraBlocks/ara-filesystem/compare/0.2.7...0.2.13) (2018-11-05)



## [0.2.7](https://github.com/AraBlocks/ara-filesystem/compare/0.2.6...0.2.7) (2018-10-26)


### Bug Fixes

* **create.js:** remove duplicate buffer creation ([843c8b2](https://github.com/AraBlocks/ara-filesystem/commit/843c8b2e25013985675297436bd0c785ab8ac855))



## [0.2.6](https://github.com/AraBlocks/ara-filesystem/compare/0.2.5...0.2.6) (2018-10-25)


### Bug Fixes

* pw requirement for editting AFS metadata ([442f74f](https://github.com/AraBlocks/ara-filesystem/commit/442f74f8046433f8b5440984bbff30be9ad35353))



## [0.2.5](https://github.com/AraBlocks/ara-filesystem/compare/0.2.4...0.2.5) (2018-10-25)



## [0.2.4](https://github.com/AraBlocks/ara-filesystem/compare/0.2.3...0.2.4) (2018-10-25)


### Bug Fixes

* **price.js:** check current price before overwriting ([6da9882](https://github.com/AraBlocks/ara-filesystem/commit/6da98827a58f5d663b1b53aa70e072d7632221ff))



## [0.2.3](https://github.com/AraBlocks/ara-filesystem/compare/0.2.2...0.2.3) (2018-10-23)



## [0.2.2](https://github.com/AraBlocks/ara-filesystem/compare/0.1.1...0.2.2) (2018-10-17)


### Bug Fixes

* cli destructure ([18bc576](https://github.com/AraBlocks/ara-filesystem/commit/18bc576813325f959087d24c1bde5037c9804509))
* Fix issue with afs creation ([dfeecdb](https://github.com/AraBlocks/ara-filesystem/commit/dfeecdb956541362dd47293f7caf61438751d69e))
* Get create and add working again ([746652b](https://github.com/AraBlocks/ara-filesystem/commit/746652b81bbd5f9e7558437502b64f552b3a73fa))
* **.travis.yml:** Cat npm debug logs instead of cp ([0ccf23d](https://github.com/AraBlocks/ara-filesystem/commit/0ccf23d140b9597c66fbb8194c8a2483e8f2b694))
* **bin/ara-filesystem:** name => network ([96aea86](https://github.com/AraBlocks/ara-filesystem/commit/96aea86241f7ca99e1e01f2130d8952641c84900))
* **create:** Fix scoping issue ([c1edcd3](https://github.com/AraBlocks/ara-filesystem/commit/c1edcd3b83d1ed2f46df3b00ddff00a0866158f6))



## [0.1.1](https://github.com/AraBlocks/ara-filesystem/compare/0.1.0...0.1.1) (2018-09-21)


### Bug Fixes

* commit ([3ad4748](https://github.com/AraBlocks/ara-filesystem/commit/3ad4748a13f5cb1140fffbd926be132f338028ee))
* **scipts/test:** migrate cp to mv ([283c107](https://github.com/AraBlocks/ara-filesystem/commit/283c107fdcc906f052ed99db1462567995fa470a))
* **scripts/test:** fix typo ([c71d606](https://github.com/AraBlocks/ara-filesystem/commit/c71d606e387121fc36253694c84cc9d66bd95ea3))
* **scripts/test:** im an idiot ([b011d2c](https://github.com/AraBlocks/ara-filesystem/commit/b011d2c7c21bc47a3b460cb7ed5fa069c696ab2f))
* **scripts/test:** revert mv back to cp ([fb3dfb9](https://github.com/AraBlocks/ara-filesystem/commit/fb3dfb95934761cde42dc33186bb753e978de8e1))
* revert commit refactor ([c5f3cf3](https://github.com/AraBlocks/ara-filesystem/commit/c5f3cf352cb9f1b0d7ad125b782df52ec8f5c61c))
* rm local test script cmds ([f6e9f11](https://github.com/AraBlocks/ara-filesystem/commit/f6e9f11519d2194821a60cf57e49befa2d325191))
* test script ([d1f1485](https://github.com/AraBlocks/ara-filesystem/commit/d1f1485358ad30c3f03c69e19044c63870e197f3))
* up gaslimit ([6df14c8](https://github.com/AraBlocks/ara-filesystem/commit/6df14c8e6aa61486f071b6694407c9ed3c99c038))


### Features

* **aid:** pass in keyringOpts to validate ([#101](https://github.com/AraBlocks/ara-filesystem/issues/101)) ([c74bec7](https://github.com/AraBlocks/ara-filesystem/commit/c74bec7bc3a5b8abd45a5bf4ac9da504bad30c8e))
* changelog setup ([51010f7](https://github.com/AraBlocks/ara-filesystem/commit/51010f712dc641f1e2e2784f0d50b3979cb3c3e8))



# [0.1.0](https://github.com/AraBlocks/ara-filesystem/compare/0d34b2c5c33fe800cfc9dbac4d7d8131983b0bcb...0.1.0) (2018-09-13)


### Bug Fixes

* **.eslintrc:** fix typo ([e518b12](https://github.com/AraBlocks/ara-filesystem/commit/e518b127dd3d0683b16c48b01500b2c00c35f344))
* **.gitignore:** add generated CFSs to gitignore ([673d58e](https://github.com/AraBlocks/ara-filesystem/commit/673d58e229120ff672607b5904bb8b50cbd651db))
* **.travis.yml:** setup travis to call bash scripts ([7a72eed](https://github.com/AraBlocks/ara-filesystem/commit/7a72eed1d43a9ac3bf50c28e611462ee7beff279))
* **add.js:** remove duplicate mirror declaration ([12e0f6e](https://github.com/AraBlocks/ara-filesystem/commit/12e0f6e4521a9eb45e758cefbbe02fa55f973888))
* **aid, create:** fix double hash for afs mnemonic and resolve afs owner did remotely ([37ef245](https://github.com/AraBlocks/ara-filesystem/commit/37ef245f68a1f26530ac64738a5c326389ab087a))
* **aid.js:** Use logical operator for each key, not whole opts object ([6c978e4](https://github.com/AraBlocks/ara-filesystem/commit/6c978e4e91e86adb8202fa9e48d4a888d5f33c80))
* **bin/ara-filesystem:** Add price arg to estimate gas func in onsetprice ([1f2c942](https://github.com/AraBlocks/ara-filesystem/commit/1f2c942b6d1be92e6a2d387a2d40f9f1e03b4056))
* **bin/ara-filesystem:** change passphrase request text ([1ac0641](https://github.com/AraBlocks/ara-filesystem/commit/1ac0641139c0daea449eb3ae3568cea0ba3bf946))
* **bin/ara-filesystem:** Rename opts to keyringOpts ([fdea4e2](https://github.com/AraBlocks/ara-filesystem/commit/fdea4e24aa11981c86590837df9da2c7c76d4af1))
* **bin/install-afs:** Add missing repo ([e8e9e19](https://github.com/AraBlocks/ara-filesystem/commit/e8e9e19168ee21008c0e2cb0d1263a4ca543dfb6))
* **bin/test:** remove cd to fix path resolution for constants.js ([fd79a98](https://github.com/AraBlocks/ara-filesystem/commit/fd79a988c4487e55e2c45324a6ec3bcf117e0bfc))
* **bin/test:** remove testrunner for now ([7d4a5a5](https://github.com/AraBlocks/ara-filesystem/commit/7d4a5a59d0b7dc60172a86c429e2243911bc2a74))
* **commit.js:** making travis happy ([46cfb4a](https://github.com/AraBlocks/ara-filesystem/commit/46cfb4a6b2d46e2a69d5f541ba30b7497f3b2935))
* **commit.js:** raise gas limit for writeAll ([6ffb6da](https://github.com/AraBlocks/ara-filesystem/commit/6ffb6da3e966305fc682e715f13d341a172c8c99))
* **commit.js:** replace old util function ([cd0177a](https://github.com/AraBlocks/ara-filesystem/commit/cd0177aa996fa6cfb4f2f8a197433875d686b066))
* **contracts/Storage.sol:** change uint to uint256 ([83c04b4](https://github.com/AraBlocks/ara-filesystem/commit/83c04b445aa3ae52f0b3617b2da0bd67537702b0))
* **contracts/Storage.sol:** fire commit event in write ([efd087b](https://github.com/AraBlocks/ara-filesystem/commit/efd087be0099ac4e3956af45e2bc86f29f9bbf42))
* **create.js:** fix merge conflicts ([97e66b1](https://github.com/AraBlocks/ara-filesystem/commit/97e66b1fd1b8ed56c89cb498fc026813e6b07362))
* **index.js:** get travis working ([4a4fb6c](https://github.com/AraBlocks/ara-filesystem/commit/4a4fb6c3c01ff266709ba0f53ea5afd5a5988e99))
* **key-path:** Fix afs create issue on fresh install ([89b24ec](https://github.com/AraBlocks/ara-filesystem/commit/89b24ec77b9cf882f3075674576f733641a95299))
* **package.json:** add ara-identity to dependencies ([cc5734a](https://github.com/AraBlocks/ara-filesystem/commit/cc5734a79e1593f4f5d7dcb0ea32c472d12235d5))
* **package.json:** add eslint config ([a771be1](https://github.com/AraBlocks/ara-filesystem/commit/a771be114b6683c422e254ae5ff9bed8aeb5a375))
* **package.json:** Bump ld-cryptosuite-registry ([ee0a070](https://github.com/AraBlocks/ara-filesystem/commit/ee0a0706521bf2ab66af2003ec6053b89797802d))
* make linter stfu ([efb28f7](https://github.com/AraBlocks/ara-filesystem/commit/efb28f7f7f98e96ed7f5ff27d5249d045099dfaa))
* **price.js:** convert token amount for afs price ([78ac274](https://github.com/AraBlocks/ara-filesystem/commit/78ac2747f8a749597af2d551150d9694bf777216))
* **README.md:** fix broken contribution links ([0d34b2c](https://github.com/AraBlocks/ara-filesystem/commit/0d34b2c5c33fe800cfc9dbac4d7d8131983b0bcb))
* :( ([31186cf](https://github.com/AraBlocks/ara-filesystem/commit/31186cfad75e5ae8eadcc618d56206212dbd3309))
* add destructure ([b2ea6c9](https://github.com/AraBlocks/ara-filesystem/commit/b2ea6c963b32b33feada5351f22bf71eebf17ef9))
* adhere to linter ([b5dc58c](https://github.com/AraBlocks/ara-filesystem/commit/b5dc58c77221652decb28f37911b7abbebffc4c6))
* args come from opts ([3f807d9](https://github.com/AraBlocks/ara-filesystem/commit/3f807d9eaffecab5915e80635ca11c9017f7e41b))
* bugs ([df047e0](https://github.com/AraBlocks/ara-filesystem/commit/df047e0ab672eb5c458a1e731a1a2f59bdb3e1f8))
* change price to uint16 and encapsulate did, password validation ([c1c36e9](https://github.com/AraBlocks/ara-filesystem/commit/c1c36e993d81af580be2916503fb84f37f1b9114))
* change throw to debug ([c6733f9](https://github.com/AraBlocks/ara-filesystem/commit/c6733f9c33fee29f8ce085df424514252d71520b))
* don't use object const ([8a3e544](https://github.com/AraBlocks/ara-filesystem/commit/8a3e5445a7557e904d9064a88c929827fcb28c26))
* eslint update and cleanup ([85a4f85](https://github.com/AraBlocks/ara-filesystem/commit/85a4f856ccbcb23368487d21fffca7cb5b71909a))
* forgot untracked files ([2ab5ac1](https://github.com/AraBlocks/ara-filesystem/commit/2ab5ac197fc08ce9c82c0e0ba436e872d262a44d))
* im an idiot ([9daea9e](https://github.com/AraBlocks/ara-filesystem/commit/9daea9efc335d976898c7a1ac24767cd9080448f))
* linting and fixing tests to match new identity creation ([2fede72](https://github.com/AraBlocks/ara-filesystem/commit/2fede72678a31b8bba5b945b4bcd2272f730bb75))
* make all paths unix-based ([f244040](https://github.com/AraBlocks/ara-filesystem/commit/f24404084d6d68941eddb221309e71d3aa3a1ece))
* missed a type check ([a9c8b66](https://github.com/AraBlocks/ara-filesystem/commit/a9c8b66893518ac0557c114a6c52105c3c44214a))
* move scripts to scripts/ ([dc88802](https://github.com/AraBlocks/ara-filesystem/commit/dc888028c8989ff0fdd6dc6eabaf7516e25cd10a))
* move truffle to top level ([7b328df](https://github.com/AraBlocks/ara-filesystem/commit/7b328df5a8dd14dd38c2f24098081661dad4c2cd))
* only be able to modify content storage ([cdcdac8](https://github.com/AraBlocks/ara-filesystem/commit/cdcdac895aaa563e5c82a99acba434ddd05c1e95))
* optimize append and write ([57a20df](https://github.com/AraBlocks/ara-filesystem/commit/57a20df9dea2ecd1f19a77d07e1248259931f412))
* password rqmt in create ([3b29626](https://github.com/AraBlocks/ara-filesystem/commit/3b296269c06a7a99bbeb0cf774750d4fd541bfa2))
* remove cfs files ([0175388](https://github.com/AraBlocks/ara-filesystem/commit/0175388780ae4170e672c07d9aeda9035bb0dc41))
* remove overwrite, migrate to afs.HOME ([7ba3d04](https://github.com/AraBlocks/ara-filesystem/commit/7ba3d0470bcc5f6aa3430585390498672383bb22))
* remove password requirement for unarchive ([1cd4dd1](https://github.com/AraBlocks/ara-filesystem/commit/1cd4dd17fa4b0d4b60afc14ab121e0463ca5a3d0))
* **test/aid.js:** make tests serial so they pass ([3ff9099](https://github.com/AraBlocks/ara-filesystem/commit/3ff90998099a6c5581fb34017550df06607213d3))
* residual bugs ([b2c3469](https://github.com/AraBlocks/ara-filesystem/commit/b2c34695e4f62158493804a832d6454ff029ca6e))
* type error check ([05dc67f](https://github.com/AraBlocks/ara-filesystem/commit/05dc67fd37e31078c2fef0bc6e2398b317c0ff2a))
* undo optional path ([#39](https://github.com/AraBlocks/ara-filesystem/issues/39)) ([ca4d3ca](https://github.com/AraBlocks/ara-filesystem/commit/ca4d3ca85da1bf32911f5db4d9c6f7785b72d1b8))
* use original mnemonic to regenerate AFS identity ([33c2f1f](https://github.com/AraBlocks/ara-filesystem/commit/33c2f1f635f63543af918167bf4044b168d3be3b))
* use outside module for checking DID method ([02bdfa3](https://github.com/AraBlocks/ara-filesystem/commit/02bdfa3ef1bf6bf82371cfb6db5c474709824a8f))
* use require instead of if for storage modifier ([#16](https://github.com/AraBlocks/ara-filesystem/issues/16)) ([71aeff8](https://github.com/AraBlocks/ara-filesystem/commit/71aeff8b9dada14c55add1a274cf7b5c2f624bda))
* use SafeMath in Storage for key add ([0cb75fc](https://github.com/AraBlocks/ara-filesystem/commit/0cb75fcdae0dcfeb9742d8f674084380a0e4041b))
* **test/*:** correct failing tests ([598a8bc](https://github.com/AraBlocks/ara-filesystem/commit/598a8bcda6302c3f996c02febc892380a91d977c))
* **util.js:** linting ([d35a9a9](https://github.com/AraBlocks/ara-filesystem/commit/d35a9a92c74264a3fe94b24d259a1a335fc80131))


### Features

* ability to resolve local identities ([133c1ae](https://github.com/AraBlocks/ara-filesystem/commit/133c1aec130cfdfcc780abfbeda39b9005291109))
* add, remove, history CLI commands; mnemonic phrase for AFS ID; resolve existing AFS; AFS tests ([9d8c579](https://github.com/AraBlocks/ara-filesystem/commit/9d8c579e2cbf87d6271a069136654849f38362ff))
* added authentication property ([3fe29c3](https://github.com/AraBlocks/ara-filesystem/commit/3fe29c3fffcc552e8a5542ba1151bc2e0e7efede))
* Allow for user to determine own AFS path ([b4af6f9](https://github.com/AraBlocks/ara-filesystem/commit/b4af6f96b0e3d72e79c571b54b5658c9d704e8f0))
* apply ddo to afs obj ([940217e](https://github.com/AraBlocks/ara-filesystem/commit/940217e77ab0483f6bd3006bf84d3969cc799da7))
* archive and resolve AFS aid ([27e1487](https://github.com/AraBlocks/ara-filesystem/commit/27e14879b75839215361a9cb5a61e65cea1147a7))
* clear metadata entirely ([7a58645](https://github.com/AraBlocks/ara-filesystem/commit/7a586454efa13e83b1a0322549f7af131b6deba8))
* cli support for create ([141a646](https://github.com/AraBlocks/ara-filesystem/commit/141a64695161c3913f42a9059c99cd69e573959a))
* commit both files in single write call ([5a87102](https://github.com/AraBlocks/ara-filesystem/commit/5a87102461b42ebd113bf10fd9b0c855b258b231))
* configurable opts for archiving and resolving ([03c2828](https://github.com/AraBlocks/ara-filesystem/commit/03c2828366549d9c65a9c954e1a5d6873ceeca42))
* extend AFS to generate own keypath ([2e7540e](https://github.com/AraBlocks/ara-filesystem/commit/2e7540e3841abc9054628978a1d1a614c6d105ff))
* force option for destroy ([c5d6659](https://github.com/AraBlocks/ara-filesystem/commit/c5d6659aaa4f953f87211c81ad7b87b42ca1a063))
* format DID uri ([913c211](https://github.com/AraBlocks/ara-filesystem/commit/913c21177aba2f9f88e195698eb702f19566387c))
* gas price CLI estimations, offset overflow fix ([ef12ed1](https://github.com/AraBlocks/ara-filesystem/commit/ef12ed123dcc361d8da2baa12103a136e76f9b15))
* generic hash util ([5453fbc](https://github.com/AraBlocks/ara-filesystem/commit/5453fbc1f7f48d2eab830ce73ea492e9b3e4b5cd))
* ignore headers on append commits, optimize commit ([2cbf4ab](https://github.com/AraBlocks/ara-filesystem/commit/2cbf4ab61a59113290865946d636059a2832b9d8))
* metadata support first pass ([8750dfe](https://github.com/AraBlocks/ara-filesystem/commit/8750dfe13f2c5edbedb077b47bfdefc1e6cb1901))
* metadata tests ([f1f70e5](https://github.com/AraBlocks/ara-filesystem/commit/f1f70e51b598e5a85f467872f69352aa0b0c4424))
* minimize writes during commit to 2 ([bad5227](https://github.com/AraBlocks/ara-filesystem/commit/bad522791f9d15d141fe4ab5f4a1834420f519a5))
* only commit metadata tree and sig ([deef331](https://github.com/AraBlocks/ara-filesystem/commit/deef33193c101814cb1848a44593b6cc5bfadc83))
* optionally set price on commit ([1797774](https://github.com/AraBlocks/ara-filesystem/commit/1797774e996913df3fc398fdd336f83e5287aa9d))
* remove password requirement for getPrice, migrate to ara cfsnet ([a6d862b](https://github.com/AraBlocks/ara-filesystem/commit/a6d862b666217418637c24d1d6bfa69a6df70c21))
* return afs instance from add/remove ([2e24385](https://github.com/AraBlocks/ara-filesystem/commit/2e243858e46fb41f4a238145fe4fadfb23d0f039))
* safety check in aid.create ([24a13cb](https://github.com/AraBlocks/ara-filesystem/commit/24a13cb5e5c92461b930eeb53a06a1789c184f0d))
* setting default afs path ([5ddc5e0](https://github.com/AraBlocks/ara-filesystem/commit/5ddc5e02ded4d6be61d9d6b263f39674424d90d3))
* setup travis to integrate with truffle ([42501e4](https://github.com/AraBlocks/ara-filesystem/commit/42501e44dd14937e9321235629044da0e5512d9d))
* unarchive first pass ([d18496d](https://github.com/AraBlocks/ara-filesystem/commit/d18496d305fb568946f7c23ce9966382cd9c5391))
* validate password by decrypt keystore ([b67dad9](https://github.com/AraBlocks/ara-filesystem/commit/b67dad9b031148557bb4d18ef1ea6df9419745ef))
* working unarchive ([04ebf7b](https://github.com/AraBlocks/ara-filesystem/commit/04ebf7b189ffd1154d6ad20305d709f9fe4a9677))
* working updated afs identity archiving ([196d4ad](https://github.com/AraBlocks/ara-filesystem/commit/196d4ad9544da1023265c268ff5779d8481e935e))
* write file to AFS metadata ([3fbed8d](https://github.com/AraBlocks/ara-filesystem/commit/3fbed8d6b0c2daa03a8b30c4d88cb4ee2752c026))
* **{commit.js, constants.js}:** merge ([2403ba7](https://github.com/AraBlocks/ara-filesystem/commit/2403ba78f8128b3f1149fd6c148175bb2b50fa99))
* **aid.js, create.js:** pass authentication wip ([9b64e2d](https://github.com/AraBlocks/ara-filesystem/commit/9b64e2dc858b035fc4157f3e72632a253b2106d4))
* **bin/ara-filesystem:** Add cli opts for keyring, name, & secret ([1c79449](https://github.com/AraBlocks/ara-filesystem/commit/1c79449b06323874fb9198d9e2e14a2eb36d9e71))
* **bin/ara-filesystem:** add force functionality for gas price confirmations ([#38](https://github.com/AraBlocks/ara-filesystem/issues/38)) ([3c95b45](https://github.com/AraBlocks/ara-filesystem/commit/3c95b4563ea86f63c48b0ee713b04d25216ad8f9))
* **create.js:** Add opts arg to aid.archive ([5d0127b](https://github.com/AraBlocks/ara-filesystem/commit/5d0127b4f6c1d4f2744f4e3f641f2c55c0f04ef8))
* **create.js:** create AFS with custom storage ([b341bd6](https://github.com/AraBlocks/ara-filesystem/commit/b341bd624a1195aa70df55a94f660c3bd05ddb5a))



