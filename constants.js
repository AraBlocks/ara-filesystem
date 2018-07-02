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
  kStorageAddress: '0x345ca3e014aaf5dca488057592ee47305d9b3e10',

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
