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

const whitelist = ["https://rendev99.com", "http://localhost:3000"];
const corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      // 만일 whitelist 배열에 origin인자가 있을 경우
      callback(null, true); // cors 허용
    } else {
      callback(new Error("Not Allowed Origin!")); // cors 비허용
    }
  },
  credentials: true,
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
};

app.use(cors(corsOptions));

// app.use(
//   cors({
//     origin: true, //["http://localhost:3001"],
//     credentials: true,
//     methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
//   })
// );

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("SEQUELIZE -=CONNECTED=-");
  })
  .catch((error) => {
    console.log(error);
  });

app.use(cookieParser());
app.use(morganMiddleware);
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/api", Router);

module.exports = app;
