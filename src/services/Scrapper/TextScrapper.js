const { IScrapper } = require('./IScrapper')

class TextScrapper extends IScrapper {
  // busqueda de columnas de las tablas
  findContent(){
    const { content } = this
    const newScrapConfig = JSON.parse(JSON.stringify(this.scrapConfig))

    const startElement = content[newScrapConfig.start.index1]
    const line = [startElement]

    let i = 1;
    let nextElement; 
    do {
      nextElement = content[newScrapConfig.start.index1 + i]

      if(nextElement.y === startElement.y) {
        line.push(nextElement)
        i++
      }
    } while(nextElement && nextElement.y === startElement.y)

    let sentence = []
    let currentColumn = null
    for(let i = 0; i < line.length; i++) {
      const element = line[i]
      
      if(!element.str.trim()) continue

      if(currentColumn) {
        currentColumn.xRange.push(element.x)
        currentColumn = null
        sentence = []
      }

      if(!currentColumn) {
        sentence.push(element)

        const sentenceStr = sentence
          .map(element => element.str.trim())
          .filter(Boolean)
          .join(' ')
  
        const column = newScrapConfig.columns.find((column) => column.columnName.toLowerCase() === sentenceStr.toLowerCase())
        if(column) {
          column.xRange = [ sentence[0].x ]
          currentColumn = column
        }
      }

      if(i === line.length - 1 && currentColumn) {
        currentColumn.xRange.push(element.x)
      }
    }

    this.scrapConfig = newScrapConfig
  }

  run () {
    const content = this.findContent()

    return content
  }
}

module.exports = TextScrapper