require("dotenv").config();
const morgan = require("morgan");
const logger = require("../config/logger");

const format = () => {
  const result = process.env.NODE_ENV === "production" ? "combined" : "dev";
  // const result = "combined";
  return result;
};

// 로그 작성을 위한 Output stream 옵션.
const stream = {
  write: (message) => {
    logger.info(message);
  },
};

// 로깅 스킵 여부 (배포 모드시 (production) 코드가 400 미만이면 기록 안함 코드가 400 이상이면 로그 기록)
const skip = (_, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.statusCode < 400;
  }
  return false;
};

//morgan에 로깅하는데 post의 body도 나오게,
morgan.token("request", (req, res) => {
  return "Request_" + JSON.stringify(req.body); //JavaScript 값이나 객체를 JSON 문자열로 변환
});
// 아직 body값이 없어서 undefined

const morganMiddleware = morgan(format(), { stream, skip });

// 모건 미들웨어 구축
// const morganMiddleware = morgan(
//   // 메세지 형식 문자열을 Define한다(기본 문자열로),
//   // 메세지 형식은 토큰으로 만들어지며,
//   // 각 토큰은 모건 라이브러리 내에 Define되있다.
//   // 이것을 사용하는 당신은 사용자 지정 토큰을 만들어 요청에서 원하는 내용을 표시할 수 있다.
//   ":method :url :request :status :res[content-length] - :response-time ms",
//   // Options: 이 케이스의 경우, Stream과 skip logic을 덮어썼다.
//   // 위의 방법을 참조하면,
//   { stream, skip }
// );

module.exports = morganMiddleware;
