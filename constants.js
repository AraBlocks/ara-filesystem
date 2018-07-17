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
  kStorageAddress: '0x1edfa7b1c42a6024026ec79d841dbb018cc7e57b',
  kPriceAddress: '0x4a5e3c49d7e55dfbfb10c1e9e413630c31c75800',

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
