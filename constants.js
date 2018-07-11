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
  kStorageAddress: '0x1c895af1828f056f4422410fff200e42a6b65bbe',

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
