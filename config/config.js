require("dotenv").config();

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
  password: process.env.TEST_PASSWORD,
  database: "rendevSQLtestCode",
  host: process.env.TEST_HOST,
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

const production = {
  username: "root",
  password: process.env.DB_PASSWORD,
  database: "rendevSQL",
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

module.exports = { development, production, test };
