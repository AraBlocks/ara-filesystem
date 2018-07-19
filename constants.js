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
  kStorageAddress: '0xfa21e79ca2dfb3ab15469796069622903919159c',
  kPriceAddress: '0xbab15d629b84e2c9575da294ab24b227e15fa02f',

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
