require("dotenv").config();
const jwt = require("jsonwebtoken");

const { User } = require("../models");

// module.exports = async (req, res, next) => {
//   try {
//     if (!req.headers.authorization && req.headers.authorization === undefined && req.headers.authorization === null) {
//       res.status(401).json({ errorMessage: "토큰의 값이 유효하지 않습니다." });

//       return next();
//     }
//     const { authorization } = req.headers;

//     if (authorization.split(" ").length !== 2) {
//       res.status(400).json({ errorMessage: "Token is not a Bearer" });
//     }

//     const [tokenType, tokenValue] = authorization.split(" ");

//     if (tokenType !== "Bearer") {
//       return res.status(401).json({ errorMessage: "로그인이 필요한 기능입니다." });
//     }

//     const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);

//     await User.findOne({ where: { userId } }).then((user) => {
//       res.locals.user = user;
//       next();
//     });
//     // const sql = "SELECT * FROM user where userId=?";
//     // db.query(sql, userId, (err, data) => {
//     //   if (err) console.log(err);
//     //   if (data.length) {
//     //     res.locals.user = data[0];
//     //     next();
//     //   }
//     // });
//   } catch (err) {
//     if (err) {
//       console.log(err);
//       res.status(401).send({ errorMessage: "토큰 유효성 검증에 실패했습니다." });
//     }
//   }
// };

module.exports = async (req, res, next) => {
  try {
    if (
      !req.headers.authorization &&
      req.headers.authorization === undefined &&
      req.headers.authorization === null
    ) {
      res.status(401).json({ errorMessage: "토큰의 값이 유효하지 않습니다." });

      return next();
    }
    const { authorization } = req.headers;

    if (authorization.split(" ").length !== 2) {
      res.status(400).json({ errorMessage: "Token is not a Bearer" });
    }

    const [tokenType, tokenValue] = authorization.split(" ");

    if (tokenType !== "Bearer") {
      return res
        .status(401)
        .json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);

    await User.findOne({ where: { userId } }).then((user) => {
      res.locals.user = user;
      next();
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.log({errorMessage : "TokenExpiredError"});

      const refreshToken = req.cookies.refreshToken;

      console.log("refresh 입니다: ", refreshToken);

      if (!refreshToken) {
        return res.status(401).send({ errorMessage: "TokenExpiredError" });
      }

      const users = await User.findAll({ where: { refreshToken } });

      try {
        if (!users) {
          return res
            .status(401)
            .json({ errorMessage: "refreshToken is unvalidate" });
        } else {
          jwt.verify(
            refreshToken,
            process.env.JWT_SECRET_REFRESH,
            (err, data) => {
              if (err) {
                return res
                  .status(403)
                  .send({ errorMessage: "refreshToken is unvalidate" });
              } else {
                const payload = {
                  userId: refreshToken.userId,
                  nickname: refreshToken.nickname,
                };
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
                  expiresIn: "1h",
                });
                return res
                  .status(200)
                  .send({ message: "토큰이 재발급 됐습니다.", token });
              }
            }
          );
        }
      } catch (err) {
        if (error.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ errorMessage: "refreshToken is expired" });
        } else {
        }
      }
    }
  }
};
