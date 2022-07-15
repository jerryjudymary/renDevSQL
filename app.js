const app = require("./index.js");
const logger = require("./config/logger");
const port = 3000;

app.listen(port, () => {
  logger.info(port, "PORT -=LISTENING=-");
});
