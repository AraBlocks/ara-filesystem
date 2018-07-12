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
  kStorageAddress: '0x4679b5245525c26bf0199021e84f5fa79fecc5bc',
  kPriceAddress: '0x9fd09dd609430da75bbbaf301b5a8a15442caac6',

  kFileMappings: {
    kContentTree: {
      name: 'content/tree',
      index: 0
    },
    kContentSignatures: {
      name: 'content/signatures',
      index: 1
    },
    kMetadataTree: {
      name: 'metadata/tree',
      index: 2
    },
    kMetadataSignatures: {
      name: 'metadata/signatures',
      index: 3
    }
  }
}
