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


const extractPersonasResponsable = async (urlbase) => {
  const url = urlbase.replace('http:','https:')
  try {
    const urlParse = qs.parseUrl(url)

    const fileName = urlParse.query.CRES_CODIGO ? `${urlParse.query.CRES_CODIGO}.pdf` : path.basename(url)
  
    const data = await extractData(url, fileName , {
      backgroundTable: {
        type: 'table',
        startLines: [
          /Personas😀comprendidas😀en😀los😀hechos😀específicos😀irregulares😀y😀presuntas😀responsabilidades😀identificadas😀\(Apéndice😀N(😀)?°😀1\):/,
          /Funcionarios😀comprendidos😀en😀los😀hechos😀y😀presuntas😀responsabilidades😀identificadas😀\(Apéndice😀1\):/,
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
    return data[0]['backgroundTable']
  } catch (error) {
    console.log('extractPersonasResponsable: ',error.message)
    insertData('errores_extraccion', {url_inform: url, mensaje : error.message})
    return []
  }
 
}

module.exports = {
  extractPersonasResponsable
}



 