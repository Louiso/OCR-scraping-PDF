const extractData = require("../src/controllers/extractor")
const qs = require('query-string')
const path = require('path')

const ColumnName = {
  DocNumber: 'DNI',
  FullName: 'Nombres y Apellidos',
  Civil: 'Civil',
  Penal: 'Penal',
  Admin: 'Admin.',
  AdmEnt: 'Adm. ENT',
  AdmPas: 'Adm. PAS',
}

const extractPersonasResponsable = async (url) => {
  try {
    console.log("[AnthonyM] ~ file: ResumenInformExtractor.js ~ line 16 ~ extractPersonasResponsable ~ url", url)
    const urlParse = qs.parseUrl(url)
    console.log(urlParse)
    const fileName = urlParse.query.CRES_CODIGO ? `${urlParse.query.CRES_CODIGO}.pdf` : path.basename(url)
    console.log(fileName)
    const endLine = `${fileName.toLowerCase().split('cp')[0]}-`
    console.log(fileName)
    const data = await extractData(url,fileName , {
      backgroundTable: {
        type: 'table',
        startLines: [
          'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
          'Funcionarios comprendidos en los hechos y presuntas responsabilidades identificadas (Apéndice 1):'
        ],
        endLines: [
          endLine
        ],
        columnNames: [
          ColumnName.DocNumber,
          ColumnName.FullName,
          ColumnName.Civil,
          ColumnName.Penal,
          ColumnName.Admin,
          ColumnName.AdmEnt,
          ColumnName.AdmPas
        ]
      }
    })
    console.log("data", JSON.stringify(data, null, 2))
  } catch (error) {
    console.log(error)
  }
 
}

module.exports = {
  extractPersonasResponsable
}



 