module.exports = {
  kDidPrefix: 'did:',
  kAidPrefix: 'did:ara:',
  kOwnerSuffix: '#owner',
  kMetadataSuffix: '#metadata',
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
