const extractData = require("./src/controllers/extractor")
const qs = require('query-string')

const ColumnName = {
  DocNumber: 'DNI',
  FullName: 'Nombres y Apellidos',
  Civil: 'Civil',
  Penal: 'Penal',
  AdmEnt: 'Adm. ENT',
  AdmPas: 'Adm. PAS',
}

const main = async () => {
  const url = 'https://apps8.contraloria.gob.pe/SPIC/srvDownload/ViewPDF?CRES_CODIGO=2022CPO061000002&TIPOARCHIVO=RE'

  const urlParse = qs.parseUrl(url)
  
  const fileName = `${urlParse.query.CRES_CODIGO}.pdf`

  const data = await extractData(url,fileName , {
    backgroundTable: {
      type: 'table',
      startLine: 'Personas comprendidas en los hechos específicos irregulares y presuntas responsabilidades identificadas (Apéndice N ° 1):',
      endLine: '2022-',
      columnNames: [
        ColumnName.DocNumber,
        ColumnName.FullName,
        ColumnName.Civil,
        ColumnName.Penal,
        ColumnName.AdmEnt,
        ColumnName.AdmPas
      ]
    }
  })

  console.log("data", JSON.stringify(data, null, 2))
}


main()



 