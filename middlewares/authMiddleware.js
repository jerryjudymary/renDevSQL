const jwt = require("jsonwebtoken");
const { User, Object } = require("../models/user.js");
require("dotenv").config();

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
    if (!userId) {
      return res.status(401).json({ errorMessage: "Token is expired" });
    } else {
      User.findOne({ userId })
        .exec()
        .then((user) => {
          res.locals.user = user;
          next();
        });
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      try {
        const { authorization, reauthorization } = req.headers;
        const [tokenType, tokenValue] = authorization.split(" ");
        const [reTokenType, reTokenValue] = reauthorization.split(" ");

        if (tokenType && reTokenType !== "Bearer") {
          return res.status(400).json({ errorMessage: "Token is not a Bearer" });
        }
        const reToken = jwt.verify(reTokenValue, process.env.JWT_SECRET_REFRESH);
        const tokenDecode = jwt.decode(tokenValue);

        if (tokenDecode.userId !== reToken.userId) {
          return res.status(400).json({ errorMessage: "Token is expired" });
        }
        const existUser = await User.findOne(tokenDecode.userId);
        if (!existUser) {
          return res.stauts(400).json({ errorMessage: "Token is expired" });
        }

        const { userId, nickname } = existUser;
        const payload = { userId, nickname };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "1h",
        });
        return res.status(200).json({
          message: "토큰이 재발급 됐습니다.",
          token,
        });
      } catch (err) {
        if (error.name === "TokenExpiredError") {
          return res.status(401).json({ errorMessage: "refreshToken is expired" });
        } else {
        }
      }
    }
  }
};
