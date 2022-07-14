require("dotenv").config();
const env = process.env;

const development = {
  username: "root",
  password: env.DB_PASSWORD,
  database: "rendevSQLtest",
  host: env.DB_HOST,
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
  password: env.DB_PASSWORD,
  database: "rendevSQLtest",
  host: env.DB_HOST,
  dialect: "mysql",
};

const production = {
  username: "root",
  password: env.DB_PASSWORD,
  database: "rendevSQLtest",
  host: env.DB_HOST,
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

module.exports = { development, production, test };
