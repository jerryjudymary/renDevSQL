const winston = require("winston");
const winstonDaily = require("winston-daily-rotate-file");
const process = require("process"); // process.cwd() 값인 루트 경로를 얻기위해 불러옴

const { combine, timestamp, label, printf } = winston.format;

// 로그 파일 저장 경로 -> 루트 경로/logs폴더
const logDir = `${process.cwd()}/logs`;

// log 출력 포맷 정의 함수
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`; // 날짜 [시스템이름] 로그레벨 메세지
});

// Log Level
// error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
const logger = winston.createLogger({
  // 로그 출력 형식 정의
  // json, label, timestamp, printf, simple, combine 등의 다양한 형식으로 지정이 가능
  // combine 여러 형식을 혼합해서 사용할 때 사용
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    label({ label: "Server" }), //어플리케이션 이름
    logFormat // log 출력 포멧
    // format: combine() 에서 정의한 timestamp와 label 형식값이 logFormat에 들어가서 정의되고 level이나 message는 콘솔에서 자동 정의
  ),

  // 실제 기록될 로그를 정의
  transports: [
    new winstonDaily({
      level: "info",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 7,
      zippedArchive: true,
    }),

    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error",
      filename: `%DATE%.error.log`,
      maxFiles: 7,
      zippedArchive: true,
    }),
  ],

  exceptionHandlers: [
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.exception.log`,
      maxFiles: 7,
      zippedArchive: true,
    }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // log level별로 색상 적용
        winston.format.simple() // `${info.level}: ${info.message} JSON.stringify({ ...rest })` 포맷으로 출력
      ),
    })
  );
}

module.exports = logger;
