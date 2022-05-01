const DbLogger = require('../Logger/DbLogger')
class IScrapper {
  logger = DbLogger()
  constructor(scrapConfig, content, meta = {}) {
    this.scrapConfig = scrapConfig
    this.content = content
  }

  run (config) {
    throw new Error('not implemented')
  }
}

exports.IScrapper = IScrapper