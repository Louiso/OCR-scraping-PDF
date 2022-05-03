
const { pool } = require("../../../scrapping/db")

const insertData = async (tablename, row) => {
  const keys = Object.keys(row)
  const vals = Object.values(row)
  
  await pool.query(
    "INSERT INTO " + tablename + "(" + keys.join(',') + ") VALUES"  + "(" +  keys.map((e,i) => "$" + (i + 1)).join(',') + ")",
    vals
  );
}

class DBLogger {
  tableName = 'errores_extraccion'
  
  log (url_inform, mensaje) {
    insertData(this.tableName, {url_inform, mensaje}).catch(console.log)
  }
}
  
module.exports = DBLogger