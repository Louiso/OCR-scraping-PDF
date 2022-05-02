const axios = require('axios');
const { pool } = require("./db")
const { extractPersonasResponsable } = require('./ResumenInformExtractor')
//const  = require('que')
const sample = {
    id: null,
    CodigoInforme: '2022CPOL48000005',
    Responsabilidad: ' CIVIL PENAL ADMINISTRATIVO ENTIDAD ',
    Departamento: 'CUSCO',
    Provincia: 'CUSCO',
    Distrito: 'WANCHAQ',
    Descripcion: 'OBRA "INSTALACIÓN DEL SISTEMA DE RIEGO QUISCO, DISTRITO DE ALTO PICHIGUA, PROVINCIA DE ESPINAR, CUSCO", EN SU COMPONENTE SISTEMA DE ALMACENAMIENTO',
    Entidad: 'PROYECTO ESPECIAL PLAN MERISS - CUSCO',
    FechaEmision: '2021/12/28',
    FechaPublicacion: '2022/04/28',
    FechaFinEjecucion: '2021/12/30',
    ModalidadServicio: 'AUDITORIA CUMPLIMIENTO',
    ServicioControl: 'SERVICIO CONTROL POSTERIOR',
    NumeroInforme: '30615-2021-CG/GRCU-AC',
    CiacCodigo: '9AH20211L480',
    CresCodigoFormato: '2022-CPO-L480-00005',
    NumeroInformeSpic: null,
    ResumenEjecutivo: 'http://apps8.contraloria.gob.pe/SPIC/srvDownload/ViewPDF?CRES_CODIGO=2022CPOL48000005&TIPOARCHIVO=RE',
    ResumenInforme: 'http://apps8.contraloria.gob.pe/SPIC/srvDownload/ViewPDF?CRES_CODIGO=2022CPOL48000005&TIPOARCHIVO=ADJUNTO',
    Sector: 'GOBIERNOS REGIONALES',
    Periodo: '2021',
    RutaCloudInforme: ' ',
    RutaCloudResumen: ' ',
    EsReconstruccion: 'N',
    TotalFuncionarios: '14',
    Funcionarios: null,
    Correlativo: 1,
    TotalRows: '28272',
    TotalPages: '142',
    Publico: 'S',
    EsCovid: 'N',
    NivelGobierno: 'GOBIERNO REGIONAL',
    TieneAnexos: '0',
    Aniofechafinejecucion: '2021',
    EsConResponsabilidad: 'S',
    CodigoEvento: 'M402',
    Evento: 'No se asocia a ningún evento                                                                                                                                                                                                                                                                                                                                                                                    ',
    CodigoOperativo: '0                                       ',
    Operativo: 'Sin operativo asociado                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              ',
    Codigo: null,
    Formato: null,
    CodigoEntidad: null,
    CodigoSector: null,
    RutaAnexo: null,
    PeriodoSeguimiento: null,
    TipoInforme: null,
    NumeroRecomendacion: null,
    EstadoRecomendacion: null,
    Recomendaciones: null,
    TotalRecomendaciones: '0'
}


const formatColumnsInforms = (data) => {
    return {
        num_inform: data.CodigoInforme,
        tipo_servicio: data.ServicioControl,
        titulo: data.Descripcion,
        url_resumen: data.ResumenEjecutivo,
        url_informe: data.ResumenInforme,
        departamento:  data.Departamento,
        provincia: data.Provincia,
        distrito: data.Distrito,
        fecha_emision: data.FechaEmision,
        fecha_publicacion: data.FechaPublicacion,
        fecha_fin_ejecucion: data.FechaFinEjecucion
    }
}

//const insertData

const insertData = async(tablename, row) => {
    const keys = Object.keys(row)
    const vals = Object.values(row)
    const query = "INSERT INTO " + tablename + "(" + keys.join(',') + ") VALUES"  + "(" +  keys.map((e,i) => "$" + (i + 1)).join(',') + ")"
    
    await  pool.query(
        "INSERT INTO " + tablename + "(" + keys.join(',') + ") VALUES"  + "(" +  keys.map((e,i) => "$" + (i + 1)).join(',') + ")",
        vals
      );
}

const delEteDataByIds =  async(tablename, key, values) => {
    console.log("DELETE FROM " + tablename + " WHERE " + key + " IN " + "(" + values.join(',') +")")
    await  pool.query(
        "DELETE FROM " + tablename + " WHERE " + key + " IN " + "(" + values.map((e,i) => '$' + (i+1)).join(',') +")",
        values
        )
}

/* const insertData =  async (data) => {
    const { 
        codInform, 
        tipoServicio, 
        tituloInform, 
        urlResumeninform, 
        urlInforme, 
        departamento, 
        provincia, 
        distrito,
        fechaEmision,
        fechaPublicacion,
        fechaFinEjecucion } = data

    await  pool.query(
        "INSERT INTO informes_control (num_imfor, tipo_servicio, titulo, url_resumen, url_informe, departamento, provincia, distrito, fecha_emision, fecha_publicacion, fecha_fin_ejecucion ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
        [codInform, tipoServicio, tituloInform, urlResumeninform, urlInforme, departamento, provincia, distrito, fechaEmision, fechaPublicacion, fechaFinEjecucion]
      );
} */

const formatColumnsPresResp = (num_inform, dataInform)=> {
    return { 
        num_inform: num_inform,
        dni : dataInform.DNI,
        fullname: dataInform['Nombres y Apellidos'],
        civil: dataInform['Civil'] == 'X',
        penal: dataInform['Civil'] == 'X',
        adm: dataInform['Admin.'] == 'X',
        adm_ent: dataInform['Adm. ENT'] == 'X',
        adm_pas: dataInform['Adm. PAS'] == 'X',
    }
}

const insertDataResponsables = async (num_informs, urlsResumens) => {
   console.log('----- Inform Scrapeados:' + urlsResumens.length + '--------')
   const responsablesData = await Promise.all(urlsResumens.map(url => extractPersonasResponsable(url)))
   const responsablesByInforms =  responsablesData.map((resps,i) => ({num_inform: num_informs[i], responsables: resps.map(e => formatColumnsPresResp(num_informs[i],e))}))
   const params = num_informs.map((e,i) => '$' + (i+1))
   const { rows } = await pool.query('SELECT num_inform , count(*) FROM presuntos_responsables WHERE num_inform in (' + params.join(',') + ')' + ' GROUP BY num_inform', num_informs);
   const newData = responsablesByInforms.filter(resp => {
       const row = rows.find(e => e.num_inform == resp.num_inform)
       return !row || row.count != resp.responsables.length
   })
   console.log('----- Nuevos Informes:' + newData.length + '--------')
   if (newData.length > 0) {
   const num_informsToDelete = newData.map( e => e.num_inform)
   await delEteDataByIds('presuntos_responsables', 'num_inform', num_informsToDelete)
   const newRows = newData.map(e=> e.responsables).flat()
   console.log('-----Nuevos Presuntos Responsables:' + newRows.length + '----------')
   await Promise.all(newRows.map( row => insertData('presuntos_responsables',row)))
   }
}

const insetDataInforms = async(scrappedData) => {
    try {
        const data = scrappedData.map((e) => formatColumnsInforms(e))
        const codesInform = data.map( e => e.num_inform)
        
        // find by codes
        const params = codesInform.map((e,i) => '$' + (i+1))
        //console.log(params)
        const { rows } = await pool.query('SELECT num_inform FROM informes_control WHERE num_inform in (' + params.join(',') + ')', codesInform);
        console.log('Scrapping Informes de control') 
        if (rows.length > 0) {
            const existsCodes = rows.map(e => e.num_inform)
            console.log('-----Scrapeados:' + data.length + '--------')
            const newRows = data.filter(e => !existsCodes.find(code => code == e.num_inform))
            console.log('-----Nuevos:' + newRows.length + '----------')
            if(newRows.length > 0){
            await Promise.all(newRows.map(e => insertData('informes_control',e)))
            console.log('----Insertados---' + newRows.length)
            }
        }else {
            console.log('-----Scrapeados:' + data.length + '--------')
            await Promise.all(data.map(e => insertData('informes_control',e)))
            console.log('----Insertados---' + data.length)
        }
        console.log('Scrapping Presuntos responsables') 
        const newNumInforms = data.map(e=> e.num_inform)
        const newUrlsResumns = data.map(e=> e.url_resumen)
        await insertDataResponsables(newNumInforms, newUrlsResumns)
    } catch (error) {
        console.log(error)
    }
}

const getDataContraloria = async(pageSize, page) => {
    try {
        const resp = await axios.get(
            'https://appbp.contraloria.gob.pe/BuscadorCGR/Informes/BusquedaInformesCGR.ashx?ActionPage=TransportType&Action=loadInformesElastic&'
            +'PageSize=' + pageSize 
            +'&PageNumber='+ page
            +'&pGeneral=+&pAnio=&pFechaInicio=01%2F01%2F1800&pFechaHasta=01%2F01%2F2500&pEntidad=&pSector=&pModalidadServicio=+NOT+%22REPORTE+DE+AVANCE%22&pReconstruccion=&pReconstruccionDepa=&pServicio=%22SERVICIO+CONTROL+POSTERIOR%22&pDepartamento=&pResponsabilidad=%22ADMINISTRATIVO%22+OR+%22PENAL%22+OR+%22CIVIL%22&pCovid=&pCovidDepa=&pNivelGobierno=&pProvincia=&pDistrito=&pAnioFinEjec=&pEsConResponsabilidad=&pEvento=&pOperativo='
            )
        return resp.data
    } catch (error) {
        console.log(error)
    }
}

const main = async() => {
    try {

       //await extractPersonasResponsable('https://apps8.contraloria.gob.pe/SPIC/srvDownload/ViewPDF?CRES_CODIGO=2022CPOL48000005&TIPOARCHIVO=RE')
        const pageSize = 100
        const data =  await getDataContraloria(pageSize, 1)
        if (data && data.length > 0) {
            const [{TotalPages}] = data
            console.log('Total de Pages:' + TotalPages)
            await insetDataInforms(data)
            for( let i=2; i<= TotalPages; i++){
                console.log('---- Page---- ' +i+ ' --------')
                const data =  await getDataContraloria(pageSize, i)
                await insetDataInforms(data)
            }
            console.log('---- Finish----')
        } else {
            console.log('No hay data')
        }
    } catch (error) {
        console.log(error)
    }
}

main()