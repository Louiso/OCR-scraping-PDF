const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();
const options = {}; /* see below */

const ColumnName = {
  DocNumber: 'DNI',
  FullName: 'Nombres y Apellidos',
  Civil: 'Civil',
  Penal: 'Penal',
  AdmEnt: 'Adm. ENT',
  AdmPas: 'Adm. PAS',
}

const scrapConfig = {
  controlTable: {
    startText: 'II. Tipo de servicio de control posterior:',
    endText: 'III. Resultados del servicio de control posterior:',
    start: {
      target: 'II. Tipo de servicio de control posterior:',
      startIndex: null,
      endIndex: null,
    },
    end: {
      target: 'III. Resultados del servicio de control posterior:',
      startIndex: null,
      endIndex: null,
    },
    startIndex: null,
    endIndex: null,
    columns: [
    ]
  },
  backgroundTable: {
    startText: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
    endText: '2022-CPO-3792-00136',
    start: {
      target: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
      startIndex: null,
      endIndex: null,
    },
    end: {
      target: '2022-CPO-3792-00136',
      startIndex: null,
      endIndex: null,
    },
    startIndex: null,
    endIndex: null,
    columns: [
      {
        columnName: ColumnName.DocNumber,
        xRange: []
      },
      {
        columnName: ColumnName.FullName,
        xRange: []
      },
      {
        columnName: ColumnName.Civil,
        xRange: []
      },
      {
        columnName: ColumnName.Penal,
        xRange: []
      },
      {
        columnName: ColumnName.AdmEnt,
        xRange: []
      },
      {
        columnName: ColumnName.AdmPas,
        xRange: []
      }
    ]
  }
}

const findTables = (scrapConfig, content) => {
  const newScrapConfig = JSON.parse(JSON.stringify(scrapConfig))

  let scrapConfigKeyIndex = 0

  const scrapConfigKeys = Object.keys(newScrapConfig)

  let pivote
  const words = content.map((item) => item.str)

  for(let i = 0 ; i < words.length; i++){
    const scrapConfigCurrent = newScrapConfig[scrapConfigKeys[scrapConfigKeyIndex]]

    if(scrapConfigCurrent) {
      const textTarget = scrapConfigCurrent.startIndex ? scrapConfigCurrent?.endText : scrapConfigCurrent?.startText

      const str = words[i];
      let sentence = str

      if(pivote) {
        sentence = words.slice(pivote - 1, i).map(str => str.trim()).filter(Boolean).join(' ')
      } else if(sentence === textTarget.split(' ')[0]) {
        pivote = i
      }

      const sentenceSanitize = sentence
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/\{/g, '\\{(')
        .replace(/\}/g, '\\}(')

      try {
        const match = textTarget.match(new RegExp(`^${sentenceSanitize}`))
        if(match && sentenceSanitize) {

          // cuando finaliza la búsqueda del textoTarget
          if(textTarget === match[0]) {
            scrapConfigCurrent.startIndex = pivote
            pivote = null

            if(textTarget === scrapConfigCurrent.endText) {
              scrapConfigCurrent.endIndex = i
              scrapConfigKeyIndex++
            }
          }
        }
      } catch (error) {
        console.log("error", error.message)
      }
    }

    if(i === words.length - 1 && scrapConfigCurrent) {
      scrapConfigCurrent.endIndex = i
    }
  } 
  return newScrapConfig
}

// busqueda de columnas de las tablas
const findColumnsOfTables = (scrapConfig, content) => {
  const newScrapConfig = JSON.parse(JSON.stringify(scrapConfig))

  const scrapConfigKeys = Object.keys(newScrapConfig)

  scrapConfigKeys.forEach((key) => {
    const scrapConfigCurrent = newScrapConfig[key]

    const startElement = content[scrapConfigCurrent.startIndex]

    const elements = content.slice(scrapConfigCurrent.startIndex, scrapConfigCurrent.endIndex + 1)
    const startSecondLine = elements.find((element) => element.y !== startElement.y)

    const secondLine = elements
      .filter((element) => element.y === startSecondLine.y)
      .map((element) => element.str)
    console.log("secondLine", secondLine)



  })

  return scrapConfig
}

// busqueda de celdas de las tablas
const findCellOfTables = (scrapConfig, content) => {
  const newScrapConfig = JSON.parse(JSON.stringify(scrapConfig))

  const scrapConfigKeys = Object.keys(newScrapConfig)

  scrapConfigKeys.forEach((key) => {
    const scrapConfigCurrent = newScrapConfig[scrapConfigKeys[scrapConfigKeyIndex]]


  })

  return scrapConfig
}

pdfExtract.extract('ViewPDF.pdf', options, (err, data) => {
  if (err) return console.log(err);

  const content = data.pages.flatMap(page => page.content)

  const newScrapConfig = findTables(scrapConfig, content)

  const newScrapConfig2 = findColumnsOfTables(newScrapConfig, content)

  console.log("newScrapConfig2", newScrapConfig2)
});