const Redis = require("redis");
require('redis-delete-wildcard')(Redis); 
const { development } = require("./redis_modules.js");
const config = require("./redis_modules.js")[process.env.NODE_ENV];

const redisClient = new Redis.createClient(config || development);
const DEFAULT_EXPIRATION = 3600; // seconds, 만료기간을 설정해 줍니다.
// redis 서버 상의 config 파일 설정으로, 최대 가용 메모리는 500MB 한도로 제한했으며
// 한도 이상의 인풋이 발생할 경우, allkeys-lru 정책으로 입력이 오래된 순부터 캐싱 데이터가 삭제됩니다.

module.exports = { redisClient, DEFAULT_EXPIRATION };
