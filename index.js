const express = require("express");
const app = express();
const helmet = require("helmet");
const morganMiddleware = require("./middlewares/morganMiddleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const csrf = require("csurf");
const { sequelize } = require("./models");
// const db = require("./models/index.js");
const logger = require("./config/logger");

const Router = require("./routes");

app.use(
  cors({
    origin: ["https://rendev99.com", "http://localhost:3000"], //["http://localhost:3001"],
    credentials: true,
    methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
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

const cspOption = {
  directives : {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),

    "script-src" : ["'self'", "*.rendev99.com"],

    "img-src": ["'self'", "s3.amazonaws.com"]
  }
}

app.use(cookieParser());
app.use(morganMiddleware);
app.use(helmet({ contentSecurityPolicy: cspOption, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", Router);
app.use(csrf());

app.use(function (req, res, next) {
  res.cookie('XSRF-TOKEN', req.csrfToken(), { sameSite: "None", secure: true});
  res.locals.csrftoken = req.csrfToken();
  next();
})

module.exports = app;
