const { IScrapper } = require('./IScrapper')

const TableScrapper = require('./TableScrapper')
const TextScrapper = require('./TextScrapper')

class ScrapConfigFactory {
  static getInstance(config, content, meta = {}) {
    switch(config.type) {
      case 'table':
        return new TableScrapper(config, content, meta);
      case 'text':
        return new TextScrapper(config, content);
      default: {
        return new IScrapper(config, content)
      }
    }
  }
}

module.exports = ScrapConfigFactory