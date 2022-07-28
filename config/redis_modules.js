require("dotenv").config();

// redis 인스턴스 선언
/****** !!! 테스트 환경은 2번 DB, 서비스 환경은 0번 DB !!! ******/
// 통합테스트 - 7번

const production = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 2,
  password: process.env.REDIS_PASSWORD,
};

const development = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 2,
  password: process.env.REDIS_PASSWORD,
};

const test = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: 7,
  password: process.env.REDIS_PASSWORD,
};

module.exports = { production, development, test };