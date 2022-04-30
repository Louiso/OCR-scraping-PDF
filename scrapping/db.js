const { Pool } = require('pg')

const pool = new Pool({
    user: 'admin',
    database: 'reto_6',
    password: 'admin',
    port: 49158,
    host: 'localhost'
})

module.exports = { pool };