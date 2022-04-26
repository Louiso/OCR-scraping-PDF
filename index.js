const ScrapConfigFactory = require('./src/Scrapper');

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
  // controlTable: {
  //   start: {
  //     target: 'II. Tipo de servicio de control posterior:',
  //     index0: null,
  //     index1: null,
  //   },
  //   end: {
  //     target: 'III. Resultados del servicio de control posterior:',
  //     index0: null,
  //     index1: null,
  //   },
  //   columns: [
  //   ]
  // },
  backgroundTable: {
    type: 'table',
    start: {
      target: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
      index0: null,
      index1: null,
    },
    end: {
      target: '2022-',
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

const findSections = (scrapConfig, content) => {
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

      // if(scrapConfigKeyIndex === 1 && !pivote) {
      //   console.log("sentence", sentence)
      //   console.log("textTarget.split(' ')[0]", textTarget.split(' ')[0])
      // }

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


pdfExtract.extract('ViewPDF.pdf', options, (err, data) => {
  if (err) return console.log(err);

  const content = data.pages.flatMap(page => page.content)

  const newScrapConfig = findSections(scrapConfig, content)

  const dataset = Object.keys(scrapConfig).map((key) => {
    const config = newScrapConfig[key]

    const scrapper = ScrapConfigFactory.getInstance(config, content)
    return {
      [key]: scrapper.run()
    }
  })

  console.log("dataset", JSON.stringify(dataset, null, 2))

  // const newScrapConfig2 = findColumnsOfTables(newScrapConfig, content)

  // console.log("newScrapConfig2", newScrapConfig2)
});
 