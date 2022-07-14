const express = require("express");
const app = express();
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { sequelize } = require("./models");
// const db = require("./models/index.js");

const usersRouter = require("./routes/users");
const projectsRouter = require("./routes/projects");
const resumesRouter = require("./routes/resumes");
const matchesRouter = require("./routes/matches");
const searchRouter = require("./routes/search");
const applicationsRouter = require("./routes/applications");
const proposalsRouter = require("./routes/proposals");
const port = 3000;
require("dotenv").config();

app.use(
  cors({
    credentials: "true",
  })
);

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("SEQUELIZE -=CONNECTED=-");
  })
  .catch((error) => {
    console.error(error);
  });

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
app.use("/api/proposals", [proposalsRouter]);

module.exports = app;