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
