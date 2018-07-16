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
  kStorageAddress: '0x629215c807bac2a04c37beb3f54de27a2149feb6',
  kPriceAddress: '0xddb250884c71578ceceb3eec53dc0961c30100f1',

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
