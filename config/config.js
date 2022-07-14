require("dotenv").config();
// DB_HOST = "3.34.200.72";
// DB_PASSWORD = "judymary";
const development = {
  username: "root",
  password: process.env.DB_PASSWORD,
  database: "rendevSQLtest",
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false,
  timezone: "+09:00",
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
    timezone: "+09:00",
  },
  define: {
    timestamps: true,
  },
};

const test = {
  username: "root",
  password: process.env.DB_PASSWORD,
  database: "rendevSQLtest",
  host: process.env.DB_HOST,
  dialect: "mysql",
};

const production = {
  username: "root",
  password: process.env.DB_PASSWORD,
  database: "rendevSQLtest",
  host: process.env.DB_HOST,
  dialect: "mysql",
};

module.exports = { development, production, test };
