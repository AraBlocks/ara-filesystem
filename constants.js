module.exports = {
  kArchiverKey: 'archiver',
  kResolverKey: 'resolver',
  kDidPrefix: 'did:',
  kAidPrefix: 'did:ara:',
  kOwnerSuffix: '#owner',
  kKeyLength: 64,
  kMetadataRegister: 'metadata',
  kContentRegister: 'content',
  kTreeFile: 'tree',
  kSignaturesFile: 'signatures',
  kStagingFile: './staged.json',
  kStorageAddress: '0x69797a4586692c4fafea7b33f77aac071da0e2e9',
  kPriceAddress: '0x383864fd16afa0af2c5516e73753e4e07e1de704',

  // metadata/tree constants
  kMetadataTreeName: 'metadata/tree',
  kMetadataTreeIndex: 0,
  kMetadataTreeBufferSize: 40,

  // metadata/signatures constants
  kMetadataSignaturesName: 'metadata/signatures',
  kMetadataSignaturesIndex: 1,
  kMetadataSignaturesBufferSize: 64
}
