const axios = require('axios');
const { pool } = require("./db")


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


const formatedData = (data) => {
    return {
        codInform: data.CodigoInforme,
        tipoServicio: data.ServicioControl,
        tituloInform: data.Descripcion,
        resumeninform: data.ResumenInforme
    }
}

const insertData =  async (data) => {
    const { codInform, tipoServicio, tituloInform, ResumenInforme } = data

    await  pool.query(
        "INSERT INTO informes_control (num_imfor, tipo_servicio, titulo, url_resumen) VALUES ($1, $2, $3, $4 ,$5)",
        [codInform, tipoServicio, tituloInform, ResumenInforme]
      );
}


const main = async() => {
    try {
        const resp = await axios.get(
            'https://appbp.contraloria.gob.pe/BuscadorCGR/Informes/BusquedaInformesCGR.ashx?ActionPage=TransportType&Action=loadInformesElastic&PageSize=200&PageNumber=1&pGeneral=+&pAnio=&pFechaInicio=01%2F01%2F1800&pFechaHasta=01%2F01%2F2500&pEntidad=&pSector=&pModalidadServicio=+NOT+%22REPORTE+DE+AVANCE%22&pReconstruccion=&pReconstruccionDepa=&pServicio=%22SERVICIO+CONTROL+POSTERIOR%22&pDepartamento=&pResponsabilidad=&pCovid=&pCovidDepa=&pNivelGobierno=&pProvincia=&pDistrito=&pAnioFinEjec=&pEsConResponsabilidad=&pEvento=&pOperativo=')
        const data = resp.data.map((e) => formatedData(e))
        const codesInform = data.map( e => e.codInform)

        // find by codes
        params = codesInform.map((e,i) => '$' + (i+1))
        console.log(params)
        const { rows } = await pool.query('SELECT num_imfor FROM informes_control WHERE num_imfor in (' + params.join(',') + ')', codesInform);
        if (rows.length > 0) {
            console.log(rows)
        }else{
           // data.map(e => insertData(e))
        }

    } catch (error) {
        console.log(error)
    }
}

main()