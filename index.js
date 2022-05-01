const extractData = require("./src/controllers/extractor")
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

const main = async () => {
  //const url = 'https://apps8.contraloria.gob.pe/SPIC/srvDownload/ViewPDF?CRES_CODIGO=2022CPO028000003&TIPOARCHIVO=RE'
  const url = 'https://apps8.contraloria.gob.pe/SPIC/srvDownload/ViewPDF?CRES_CODIGO=2022CPO131700001&TIPOARCHIVO=RE'

  const urlParse = qs.parseUrl(url)

  const fileName = urlParse.query.CRES_CODIGO ? `${urlParse.query.CRES_CODIGO}.pdf` : path.basename(url)

  const endLine = `${fileName.toLowerCase().split('cp')[0]}-`

  const data = await extractData(url, fileName , {
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
}


main()


// pip install pdfminer.six
// esteban.wilfredo.g@gmail.com
// "LUIS" site:elcomercio.pe
// "PEDRO CASTILLO" corrupción site:elcomercio.pe

 