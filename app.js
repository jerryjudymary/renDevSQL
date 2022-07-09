const express = require("express");
const app = express();
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// const db = require("./models/index.js");
const { sequelize } = require("./models");

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("sequlize 연결 성공");
  })
  .catch((error) => {
    console.error(error);
  });

const usersRouter = require("./routes/users");
const projectsRouter = require("./routes/projects");
const resumesRouter = require("./routes/resumes");
const matchesRouter = require("./routes/matches");
const searchRouter = require("./routes/search");
const applicationsRouter = require("./routes/applications");
const port = 3000;
require("dotenv").config();

app.use(
  cors({
    // exposedHeaders:["authorization"],
    origin: "*",
    credentials: "true",
  })
);

// const connect = require("./models");
// connect();

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, crossOriginResourcePolicy: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api/users", [usersRouter]);
app.use("/api/projects", [projectsRouter]);
app.use("/api/resumes", [resumesRouter]);
app.use("/api/matches", [matchesRouter]);
app.use("/api/search", [searchRouter]);
app.use("/api/applications", [applicationsRouter]);
app.listen(port, () => {
  console.log(port, "포트로 서버가 켜졌습니다.");
});
