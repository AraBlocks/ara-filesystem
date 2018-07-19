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
  kStorageAddress: '0xd38bbd737e01915f8c57ceab24790610b88b2369',
  kPriceAddress: '0xe7d6c54cf8bd798eda9e9a3aa094fb01ef34c251',

  kFileMappings: {
    kMetadataTree: {
      name: 'metadata/tree',
      index: 0
    },
    kMetadataSignatures: {
      name: 'metadata/signatures',
      index: 1
    }
  }
}
