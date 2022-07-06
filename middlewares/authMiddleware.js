// const jwt = require("jsonwebtoken");

require("dotenv").config();
// const db = require("../config/database");

const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const [tokenType, tokenValue] = authorization.split(" ");
  // tokenType이 'Bearer'가 아니면 로그인이 안되게 함
  if (tokenType !== "Bearer") {
    res.status(401).send({
      errorMassage: "로그인 후 사용하세요",
    });
    return;
  }

  try {
    // jwt 토큰 인증이 성공해야만
    const { userId } = jwt.verify(tokenValue, "secret-key");
    // 이런 모양일 때만 next(); 허용
    // User.findById(userId).exec()에 DB에서 사용자 정보를 불러와서 넣어주고 next 호출
    // User.findById(userId).exec()  몽구스에서 사용하는 방식
    User.findOne({ userId }) // 몽구스에서 findById는 sequelize에서 findByPk를 사용함 Pk는 primary key로 (userId)를 찾음
      .then((user) => {
        // sequelize는 기본적으로 promise 반환하도록 되어있음
        // auth-middlewares를 사용하는 곳은 res.locals.user = user; 에 접근하면 항상 사용자가 사용자 정보가 들어있는 상태로 API로 구현하면 된다.
        res.locals.user = user;
        next();
      });
  } catch (error) {
    res.status(401).send({
      errorMassage: "로그인 후 사용하세요",
    });
    return;
  }
};

// module.exports = async (req, res, next) => {
//   try {
//     const { authorization } = req.headers;

//     if (!authorization) return next();

//     if (authorization.split(" ").length !== 2) {
//       res.status(400).json({ errorMessage: "Token is not a Bearer" });
//     }

//     const [tokenType, tokenValue] = authorization.split(" ");

//     if (tokenType !== "Bearer") {
//       return res.status(401).json({ errorMessage: "로그인이 필요한 기능입니다." });
//     }

//     const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);

//     const sql = "SELECT * FROM users where userId=?";
//     await db.query(sql, userId, (err, data) => {
//       if (err) console.log(err);
//       if (data.length) {
//         res.locals.user = data[0];
//         next();
//       }
//     });
//   } catch (err) {
//     if (err) {
//       console.log(err);
//       res.status(401).send({ errorMessage: "토큰 유효성 검증에 실패했습니다." });
//     }
//   }
// };
