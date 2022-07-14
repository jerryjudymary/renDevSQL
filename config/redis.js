require("dotenv").config();
const Redis = require('redis');

// redis 인스턴스 선언

/****** !!! 테스트 환경은 2번 DB, 서비스 환경은 0번 DB !!! ******/

const redisClient = new Redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db:2,
    password: process.env.REDIS_PASSWORD
});

const DEFAULT_EXPIRATION = 3600 // seconds, 만료기간을 설정해 줍니다.
  
  // redis 서버 상의 config 파일 설정으로, 최대 가용 메모리는 500MB 한도로 제한했으며
  // 한도 이상의 인풋이 발생할 경우, allkeys-lru 정책으로 입력이 오래된 순부터 캐싱 데이터가 삭제됩니다.


module.exports = { redisClient, DEFAULT_EXPIRATION };