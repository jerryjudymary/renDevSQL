
const express = require("express");
const app = express();
const helmet = require("helmet");
const morganMiddleware = require("./middlewares/morganMiddleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sequelize } = require("./models");
// const db = require("./models/index.js");
const logger = require("./config/logger");

const Router = require("./routes");

app.use(
  cors({
    origin: true, //["http://localhost:3001"],
    credentials: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE'
  })
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("SEQUELIZE -=CONNECTED=-");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(cookieParser());
// app.use(function(req, res, next) {
//   res.header('Content-Type', 'application/json;charset=UTF-8')
//   res.header('Access-Control-Allow-Credentials', true)
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept'
//   )
//   next()
// })
app.use(morganMiddleware);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", Router);

module.exports = app;
