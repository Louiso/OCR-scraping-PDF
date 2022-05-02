const ScrapConfigFactory = require('../services/Scrapper');
const Downloader = require('../services/Downloader');
const fs = require('fs')

const PDFExtract = require('pdf.js-extract').PDFExtract;

const pdfExtract = new PDFExtract();
const options = {}; /* see below */

const buildScrapConfig = (scrapConfigInit) => {
  return Object.keys(scrapConfigInit).reduce((acc, key) => {
    return {
      ...acc,
      [key]: {
        type: scrapConfigInit[key].type,
        start: {
          targets: scrapConfigInit[key].startLines,
          target: '',
          index0: null,
          index1: null,
        },
        end: {
          targets: scrapConfigInit[key].endLines,
          target: '',
          index0: null,
          index1: null,
        },
        columns: scrapConfigInit[key].columnNames.map((columnName) => ({
          columnName,
          xRange: []
        }))
      }
    }
  }, {})
}

const findSections = (scrapConfig, content) => {
  const newScrapConfig = JSON.parse(JSON.stringify(scrapConfig))

  let scrapConfigKeyIndex = 0

  const scrapConfigKeys = Object.keys(newScrapConfig)

  const words = content.map((item) => item.str)

  for(let i = 0 ; i < words.length; i++){
    const scrapConfigCurrent = newScrapConfig[scrapConfigKeys[scrapConfigKeyIndex]]

    if(scrapConfigCurrent) {
      const textTargets = scrapConfigCurrent.start.index1 ? scrapConfigCurrent?.end.targets : scrapConfigCurrent?.start.targets

      const textTarget = scrapConfigCurrent.start.index1 ? scrapConfigCurrent?.end.target : scrapConfigCurrent?.start.target

      const str = words[i];
      let sentence = str

      const pivote = scrapConfigCurrent.start.index1 ? 
        scrapConfigCurrent.end.index0: 
        scrapConfigCurrent.start.index0

      const textTargetFound = textTargets.find((textTarget) => textTarget.split(' ')[0] === sentence)
      if(pivote) {
        sentence = words
          .slice(pivote - 1, i)
          .map(str => str.trim())
          .filter(Boolean)
          .join(' ')

      } else if(textTargetFound) {
        if(scrapConfigCurrent?.end.targets.includes(textTargetFound)) {
          scrapConfigCurrent.end.index0 = i
          scrapConfigCurrent.end.target = textTargetFound
        } else {
          scrapConfigCurrent.start.index0 = i
          scrapConfigCurrent.start.target = textTargetFound
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
        } else {
          const textoTargetArray = textTarget.split(' ')
          const sentenceSanitizeArray = sentenceSanitize.split(' ')

          if(
            sentenceSanitizeArray.length >= 2 &&
            textoTargetArray[1] !== sentenceSanitizeArray[1]
          ) {
            const fieldName = scrapConfigCurrent.start.index1 ? 'end': 'start'

            scrapConfigCurrent[fieldName].index0 = null
            scrapConfigCurrent[fieldName].target = ''
          }
        }
      } catch (error) {
        console.log("error", error.message)
      }
    }

    if(i === words.length - 1 && scrapConfigCurrent) {
      scrapConfigCurrent.end.index1 = i
      if(!scrapConfigCurrent.end.index0) scrapConfigCurrent.end.index0 = i - 1
    }
  } 
  return newScrapConfig
}

const extractData = (urlFile, fileName, scrapConfigInit) => {
  console.log("[AnthonyM] ~ file: extractor.js ~ line 126 ~ extractData ~ urlFile", urlFile)
  return new Promise(async (resolve) => {
    const scrapConfig = buildScrapConfig(scrapConfigInit)

    const outputPath = await Downloader.downloadFileByUrl(urlFile, fileName)

    pdfExtract.extract(outputPath, options, (err, data) => {
      console.log("[AnthonyM] ~ file: extractor.js ~ line 132 ~ pdfExtract.extract ~ outputPath", outputPath)
      if (err) return console.log(err);
    
      const content = data.pages.flatMap(page => page.content)

      // console.log("content", content.map((element) => element.str).join(''))
    
      const newScrapConfig = findSections(scrapConfig, content)
    
      // console.log("newScrapConfig", JSON.stringify(newScrapConfig, null, 2))

      const dataset = Object.keys(scrapConfig).map((key) => {
        const config = newScrapConfig[key]
    
        const scrapper = ScrapConfigFactory.getInstance(config, content)
        return {
          [key]: scrapper.run()
        }
      })

      resolve(dataset)
      try {
        fs.unlinkSync(outputPath)
      //file removed
      } catch(err) {
        console.error(err)
      }        
    });
  })
}

module.exports = extractData