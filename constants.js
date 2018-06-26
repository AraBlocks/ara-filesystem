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
  kStorageAddress: '0x90a78a400c4c7455bf80e0a9a4f67d006fe1bc7a',

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
