const jwt = require("jsonwebtoken");

require("dotenv").config();

const db = require("../config/database");

module.exports = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) return next();

    if (authorization.split(" ").length !== 2) {
      res.status(400).json({ errorMessage: "Token is not a Bearer" });
    }

    const [tokenType, tokenValue] = authorization.split(" ");

    if (tokenType !== "Bearer") {
      return res.status(401).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);

    const sql = "SELECT * FROM users where userId=?";
    await db.query(sql, userId, (err, data) => {
      if (err) console.log(err);
      if (data.length) {
        res.locals.user = data[0];
        next();
      }
    });
  } catch (err) {
    if (err) {
      console.log(err);
      res.status(401).send({ errorMessage: "토큰 유효성 검증에 실패했습니다." });
    }
  }
};
