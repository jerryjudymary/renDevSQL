const app = require("./index.js");
const port = 3000;
const logger = require("./config/logger");

app.listen(port, () => {
  logger.info(`${port} -=LISTENING=-`);
});
