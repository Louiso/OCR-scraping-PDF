const { IScrapper } = require('./IScrapper')

class TableScrapper extends IScrapper {
  
  // busqueda de columnas de las tablas
  findColumnsOfTables(){
    try {
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
    } catch (error) {
      const urlinform = this.meta.url_inform
      this.logger.log(urlinform, error.message)
      console.log("[AnthonyM] ~ file: TableScrapper.js ~ line 62 ~ TableScrapper ~ findColumnsOfTables ~ error", error)

    }
  }

// busqueda de celdas de las tablas
  findCellOfTables () {
    const { content } = this
    const newScrapConfig = JSON.parse(JSON.stringify(this.scrapConfig))

    const elements = content.slice(newScrapConfig.start.index1, newScrapConfig.end.index0)

    const [ firstElement ] = elements

    const rest = elements.filter((element) => element.y !== firstElement.y)

    const ys = rest.map((element) => element.y).filter((y, index, self) => self.indexOf(y) === index)

    const nodes = ys.map((y) => {
      const cells = rest.filter((element) => element.y === y)

      return newScrapConfig.columns.reduce((acc, column) => {
        const _cells = cells.filter((cell) => cell.x >= column.xRange[0] && cell.x < column.xRange[1])

        const str = _cells
        .map(element => element.str.trim())
        .filter(Boolean)
        .join(' ')
        return {
          ...acc,
          [column.columnName]: str
        }
      }, {})
    })

    return nodes.filter((node) => Object.values(node).some((value) => value))
  }


  run () {
    this.findColumnsOfTables()

    const nodes = this.findCellOfTables()

    return nodes
  }
}

module.exports = TableScrapper