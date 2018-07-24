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
  kPriceAddress: '0xf25186b5081ff5ce73482ad761db0eb0d25abfbf',

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
