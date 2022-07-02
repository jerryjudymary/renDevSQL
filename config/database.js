require("dotenv").config();
const mysql = require("mysql");

const db = mysql.createConnection({
  // host: process.env.DB_HOST,
  host: "3.34.200.72",
  user: "root",
  // password: process.env.DB_PASSWORD,
  password: "judymary",
  database: "rendev",
});

module.exports = db;
