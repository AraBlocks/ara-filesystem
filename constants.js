module.exports = {
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
  kStorageAddress: '0x2c2b9c9a4a25e24b174f26114e8926a9f2128fe4',

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
