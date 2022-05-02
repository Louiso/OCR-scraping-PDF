const DBLogger = require('../LoggerErrors/DbLogger')
class IScrapper {
  constructor(scrapConfig, content, meta = {}) {
    this.logger = new DBLogger()
    this.scrapConfig = scrapConfig
    this.content = content
    this.meta = meta
  }

  run (config) {
    throw new Error('not implemented')
  }
}

exports.IScrapper = IScrapper