const { Pool } = require('pg')

const pool = new Pool({
    user: 'fiscales',
    database: 'reto_6',
    password: 'fiscales',
    port: 5432,
    host: 'localhost'
})

module.exports = { pool };