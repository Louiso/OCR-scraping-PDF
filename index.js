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
    start: {
      target: 'II. Tipo de servicio de control posterior:',
      index0: null,
      index1: null,
    },
    end: {
      target: 'III. Resultados del servicio de control posterior:',
      index0: null,
      index1: null,
    },
    columns: [
    ]
  },
  backgroundTable: {
    start: {
      target: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
      index0: null,
      index1: null,
    },
    end: {
      target: '2022-CPO-3792-00136',
      index0: null,
      index1: null,
    },
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

  const words = content.map((item) => item.str)

  for(let i = 0 ; i < words.length; i++){
    const scrapConfigCurrent = newScrapConfig[scrapConfigKeys[scrapConfigKeyIndex]]

    if(scrapConfigCurrent) {
      const textTarget = scrapConfigCurrent.start.index1 ? scrapConfigCurrent?.end.target : scrapConfigCurrent?.start.target

      const str = words[i];
      let sentence = str

      const pivote = scrapConfigCurrent.start.index1 ? 
        scrapConfigCurrent.end.index0: 
        scrapConfigCurrent.start.index0

      if(pivote) {
        sentence = words
          .slice(pivote - 1, i)
          .map(str => str.trim())
          .filter(Boolean)
          .join(' ')

      } else if(sentence === textTarget.split(' ')[0]) {
        if(textTarget === scrapConfigCurrent?.end.target) {
          scrapConfigCurrent.end.index0 = i
        } else {
          scrapConfigCurrent.start.index0 = i
        }
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
            if(textTarget === scrapConfigCurrent.end.target) {
              scrapConfigCurrent.end.index1 = i
              scrapConfigKeyIndex++
            } else {
              scrapConfigCurrent.start.index1 = i
            }
          }
        }
      } catch (error) {
        console.log("error", error.message)
      }
    }

    if(i === words.length - 1 && scrapConfigCurrent) {
      scrapConfigCurrent.end.index1 = i
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

    const startElement = content[scrapConfigCurrent.index0]

    const elements = content.slice(scrapConfigCurrent.index0, scrapConfigCurrent.index1 + 1)
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
  console.log("Luis Sullca ~ file: index.js ~ line 182 ~ pdfExtract.extract ~ newScrapConfig", newScrapConfig)

  // const newScrapConfig2 = findColumnsOfTables(newScrapConfig, content)

  // console.log("newScrapConfig2", newScrapConfig2)
});


/* 
  newScrapConfig2 {
    controlTable: {
      start: {
        target: 'II. Tipo de servicio de control posterior:',
        index0: null,
        index1: null
      },
      end: {
        target: 'III. Resultados del servicio de control posterior:',
        index0: null,
        index1: null
      },
      index0: 352,
      index1: 365,
      columns: []
    },
    backgroundTable: {
      start: {
        target: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
        index0: null,
        index1: null
      },
      end: { target: '2022-CPO-3792-00136', index0: null, index1: null },
      index0: 829,
      index1: 1037,
      columns: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
    }
  }

  {
    controlTable: {
      startText: 'II. Tipo de servicio de control posterior:',
      endText: 'III. Resultados del servicio de control posterior:',
      start: {
        target: 'II. Tipo de servicio de control posterior:',
        index0: 270,
        index1: null
      },
      end: {
        target: 'III. Resultados del servicio de control posterior:',
        index0: null,
        index1: 1037
      },
      index0: null,
      index1: null,
      columns: []
    },
    backgroundTable: {
      startText: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
      endText: '2022-CPO-3792-00136',
      start: {
        target: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
        index0: null,
        index1: null
      },
      end: { target: '2022-CPO-3792-00136', index0: null, index1: null },
      index0: null,
      index1: null,
      columns: [ [Object], [Object], [Object], [Object], [Object], [Object] ]
    }
  }
*/