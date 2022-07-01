const mysql = require('mysql2');

const db = mysql.createConnection({
    host     : process.env.DB_HOST,
    user     : 'root',
    password : process.env.DB_PASSWORD,
    database : 'rendev'
  });

module.exports = db

