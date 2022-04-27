const main = async () => {
  const data = await extractData(path.resolve(__dirname, 'ViewPDF.pdf'), {
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