class IScrapper {
  constructor(scrapConfig, content) {
    this.scrapConfig = scrapConfig
    this.content = content
  }

  run (config) {
    throw new Error('not implemented')
  }
}

exports.IScrapper = IScrapper