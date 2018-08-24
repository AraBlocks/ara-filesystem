module.exports = {

  kArchiverSecret: 'ara-archiver',
  kResolverSecret: 'ara-resolver',
  kArchiverRemote: 'remote1',
  kResolverRemote: 'remote2',

  kDidPrefix: 'did:',
  kAidPrefix: 'did:ara:',
  kOwnerSuffix: '#owner',
  kKeyLength: 64,
  kMetadataRegister: 'metadata',
  kContentRegister: 'content',
  kTreeFile: 'tree',
  kSignaturesFile: 'signatures',
  kStagingFile: './staged.json',

  // metadata/tree constants
  kMetadataTreeName: 'metadata/tree',
  kMetadataTreeIndex: 0,
  kMetadataTreeBufferSize: 40,

  // metadata/signatures constants
  kMetadataSignaturesName: 'metadata/signatures',
  kMetadataSignaturesIndex: 1,
  kMetadataSignaturesBufferSize: 64
}

// ank -i 4e56ed331bb52ae28f18969982275bb156f81f4b23c22115e9ddd2b51b4c89c4 -s ara-archiver -n remote1 -o ~/.ara/keyrings/ara-archiver
// ank -i 4e56ed331bb52ae28f18969982275bb156f81f4b23c22115e9ddd2b51b4c89c4 -s ara-resolver -n remote2 -o ~/.ara/keyrings/ara-resolver

// ann -t . -s ara-archiver -n remote1 -k ~/.ara/keyrings/ara-archiver -i 4e56ed331bb52ae28f18969982275bb156f81f4b23c22115e9ddd2b51b4c89c4
// ann -t . -s ara-resolver -n remote2 -k ~/.ara/keyrings/ara-resolver -i 4e56ed331bb52ae28f18969982275bb156f81f4b23c22115e9ddd2b51b4c89c4
