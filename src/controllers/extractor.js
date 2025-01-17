const ScrapConfigFactory = require('../services/Scrapper');
const Downloader = require('../services/Downloader');
const fs = require('fs')
const { produce } = require('immer')
const DBLogger = require('../services/LoggerErrors/DbLogger')

const PDFExtract = require('pdf.js-extract').PDFExtract;

const pdfExtract = new PDFExtract();
const logger = new DBLogger();
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
        })),
        columnNamesRequired: scrapConfigInit[key].columnNamesRequired,
      }
    }
  }, {})
}

const findSections = (scrapConfig, content) => {
  const newScrapConfig = produce(scrapConfig)

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

const initPositionConfig = (position, config, content) => {
  const content_replace = content.map((element) => {
    return ['', ' '].includes(element.str) ? {...element, str: '😀'} : element
  })

  const contentText = content_replace.map((element) => element.str).join('')
  // console.log("Luis Sullca ~ file: extractor.js ~ line 134 ~ initPositionConfig ~ contentText", contentText)

  config.end.targets = [
    new RegExp(Array.from(contentText.split(/😀/)).pop())
  ]

  const words = content.map((item) => item.str)

  const newConfig = produce(config, (draft) => {
    for(let target of draft[position].targets) {
      const match = contentText.match(target)

      // console.log("match", match)
      
      if(!match) continue
      
      const [ matchText ] = match
      const lastIndex = match.index + matchText.length
      const startIndexSentence = contentText.split('').slice(0, match.index).join('').split(/😀/).length - 1
      const endIndexSentence = contentText.split('').slice(0, lastIndex).join('').split(/😀/).length - 1
      
      const startIndex = startIndexSentence * 2 - target.toString().split(/😀/).length * 3
      const endIndex = words.length//endIndexSentence * 2 + target.toString().split(/😀/).length * 32
      // console.log("Luis Sullca ~ file: extractor.js ~ line 156 ~ newConfig ~ startIndex", startIndex)
      // console.log("Luis Sullca ~ file: extractor.js ~ line 157 ~ newConfig ~ endIndex", endIndex)
      // console.log("contentText", words.length)

      let i = startIndex
      let matchTarget
      while(!matchTarget && i <= endIndex) {
        const pivote = draft[position].index0
        
        const str = words[i];
        let sentence = str ?? ''

        const firstWord = target.toString().replace(/\//g, '').split(/😀/)[0]
        
        const textTargetFound = firstWord === sentence

        if(pivote) {
          sentence = words
            .slice(pivote - 1, i)
            .map(str => str.trim())
            .filter(Boolean)
            .join('😀')
  
        } else if(textTargetFound) {
          draft[position].index0 = i
        }

        const sentenceSanitize = sentence

        // console.log("sentenceSanitize", sentenceSanitize)
        // console.log("target", target)
        const match = sentenceSanitize.match(target)

        if(match && sentenceSanitize) {
          draft[position].index1 = i
          draft[position].target = target
          break
        }

        i++
      }

      if(!draft[position].index0) {
        draft[position].index0 = i - 1
      }
    }
  })
  return newConfig
}

const findSections2 = (scrapConfig, content) => {
  const newScrapConfig = scrapConfig//produce(scrapConfig, (draft) => draft)

  // const scrapConfigKeys = Object.keys(newScrapConfig)

  Object.keys(newScrapConfig).forEach((key) => {
    const config = newScrapConfig[key]

    const newConfig = initPositionConfig('start', config, content)
    const newConfig2 = initPositionConfig('end', newConfig, content)

    // console.log("newConfig2", newConfig2)

    newScrapConfig[key] = newConfig2
  })

  // console.log("newScrapConfig", newScrapConfig)

  return newScrapConfig
}


const extractData = (urlFile, fileName, scrapConfigInit) => {
  return new Promise(async (resolve) => {
    const scrapConfig = buildScrapConfig(scrapConfigInit)

    const outputPath = await Downloader.downloadFileByUrl(urlFile, fileName)

    pdfExtract.extract(outputPath, options, (err, data) => {
      try {
        if (err) {
          logger.log(urlFile, err.message)
          return console.log(err);
        }
        const content = data.pages.flatMap(page => page.content)
  
        // console.log("content", content.map((element) => element.str).join(''))
      
        const newScrapConfig = findSections2(scrapConfig, content)
      
        // console.log("newScrapConfig", JSON.stringify(newScrapConfig, null, 2))
  
        const dataset = Object.keys(scrapConfig).map((key) => {
          const config = newScrapConfig[key]
      
          const scrapper = ScrapConfigFactory.getInstance(config, content, {url_inform: urlFile})
          return {
            [key]: scrapper.run()
          }
        })
  
        resolve(dataset)

        fs.unlinkSync(outputPath)  
      } catch (error) {
        console.error(error)
      }     
    });
  })
}

module.exports = extractData