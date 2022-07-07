const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
require("dotenv").config();

const { User } = require("../models");

const db = require("../config/database");

const { postLoginSchema, postUsersSchema, postNicknameSchema, postUserIdSchema } = require("./validation.controller.js");

const signUp = async (req, res) => {
  console.log(req.body);

  try {
    var { password, passwordCheck, name, birth, phone, policy } = await postUsersSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send({ errorMessage: "작성 형식을 확인해주세요" });
  }
  var { userId, nickname } = req.body;
  const profileImage = "";
  const refreshToken = "";

  if (userId && nickname && password && phone && birth && name && passwordCheck === "") {
    res.status(400).send({ errorMessage: "작성란을 모두 기입해주세요." });
  }

  try {
    if (password === passwordCheck) {
      const [bcryptPw, idExist, nickExist] = await Promise.all([(password = bcrypt.hashSync(password, saltRounds)), User.findOne({ where: { userId } }), User.findOne({ where: { nickname } })]);

      if (!idExist && !nickExist) {
        const users = await User.create({ userId, nickname, password: bcryptPw, passwordCheck, name, birth, phone, policy, profileImage, refreshToken });

        res.status(200).send({ users: users, message: "회원가입을 축하합니다." });
      } else if (idExist) {
        return res.status(400).send({ errorMessage: "중복 검사가 필요합니다." });
      } else if (nickExist) {
        return res.status(400).send({ errorMessage: "중복 검사가 필요합니다." });
      }
    } else {
      res.status(400).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
    }
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ errorMessage: "회원가입에 실패했습니다." });
    }
  }
};

const checkUserId = async (req, res) => {
  try {
    var { userId } = await postUserIdSchema.validateAsync(req.body);
  } catch (err) {
    if (err) {
      console.log(err);
    }
    return res.status(400).send({ errorMessage: "이메일 형식에 맞지 않습니다." });
  }

  try {
    const user = await User.findOne({ where: { userId } });
    if (user) {
      return res.status(400).send({ errorMessage: "중복된 아이디 입니다." });
    } else {
      return res.status(200).send({ message: "사용 가능한 아이디 입니다." });
    }
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ errorMessage: "중복된 아이디 입니다." });
    }
  }
};

const checkNickname = async (req, res) => {
  try {
    var { nickname } = await postNicknameSchema.validateAsync(req.body);
  } catch (err) {
    if (err) {
      console.log(err);
    }
    return res.status(400).send({ errorMessage: "한글자 이상 입력해주세요." });
  }

  try {
    const user = await User.findOne({ where: { nickname } });
    if (user) {
      return res.status(400).send({ errorMessage: "중복된 닉네임 입니다." });
    } else {
      return res.status(200).send({ message: "사용 가능한 닉네임 입니다." });
    }
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ errorMessage: "중복된 닉네임 입니다." });
    }
  }
};

const login = async (req, res) => {
  try {
    var { userId, password } = await postLoginSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send({ errorMessage: "아이디 또는 패스워드가 유효하지 않습니다." });
  }

  try {
    const users = await User.findOne({ where: { userId } });
    if (users) {
      console.log(users);
      const hashed = bcrypt.compareSync(password, users.password);

      if (!hashed) {
        return res.status(400).send({ errorMessage: "아이디 또는 비밀번호가 일치하지 않습니다." });
      } else if (!users) {
        return res.status(400).send({ errorMessage: "존재하지 않는 유저입니다." });
      } else {
        const payload = {
          userId: users.userId,
          nickname: users.nickname,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "2h",
        });
        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
          expiresIn: "2d",
        });

        console.log(refreshToken);
        await User.update({ refreshToken }, { where: { userId } });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
        });
        return res.status(200).send({ message: "로그인 하셨습니다.", token });
      }
    }
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(401).send({ errorMessage: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  console.log("refresh 입니다: ", refreshToken);

  if (!refreshToken) {
    return res.status(401).send({ errorMessage: "Token is expired" });
  }

  const users = await User.findAll({ where: { refreshToken } });
  console.log("users입니다:", users);

  try {
    if (!users) {
      return res.status(401).json({ errorMessage: "refreshToken is unvalidate" });
    } else {
      jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, data) => {
        if (err) {
          return res.status(403).send({ errorMessage: "refreshToken is unvalidate" });
        } else {
          const payload = {
            userId: refreshToken.userId,
            nickname: refreshToken.nickname,
          };
          const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: "1h",
          });
          return res.status(200).send({ message: "토큰이 재발급 됐습니다.", token });
        }
      });
    }
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(401).send({ errorMessage: "refreshToken is unvalidate" });
    }
  }
};

const userDetail = async (req, res) => {
  try {
    const user = res.locals.user;
    if (user === undefined) {
      return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    } else {
      const { nickname } = req.params;

      const nickInfo = await User.findOne({ where: { nickname } });
      if (!nickInfo) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        return res.status(200).send(nickInfo);
      }
    }
  } catch (err) {
    if (err) {
      console.log(err);
      res.status(400).send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
    }
  }
};

const userInfo = async (req, res) => {
  try {
    const user = res.locals.user;
    if (user === undefined) {
      return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    } else {
      const { userId } = res.locals.user;

      const users = await User.findOne({ where: { userId } });
      if (!users) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        return res.status(200).send({ userId: users.userId, nickname: users.nickname });
      }
    }
  } catch (err) {
    res.status(400).send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
  }
};

const updatePw = async (req, res) => {
  try {
    const { userId } = res.locals.user;
    if (userId === undefined) {
      return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    }
    let { password, newPassword } = req.body;
    bcrypt.hash(newPassword, saltRounds, (err, hash) => {
      if (err) {
        console.log(err);
        return res.stauts(400).send({ errorMessage: "hash에 실패했습니다." });
      } else {
        newPassword = hash;
      }
    });

    const users = await User.findOne({ where: { userId } });
    if (!users) {
      return res.status(401).send({ errorMessage: "비밀번호를 확인해 주세요" });
    } else {
      console.log(users);
      const hashed = bcrypt.compareSync(password, users.password);
      if (!hashed) {
        return res.status(401).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
      } else {
        const updatePw = await User.update({ password: newPassword }, { where: { userId } });
        return res.status(200).send({ message: "비밀번호 변경에 성공했습니다.", updatePw });
      }
    }
  } catch (err) {
    if (err) {
      console.log(err);
      res.status(400).send({ errorMessage: "비밀번호를 확인해 주세요" });
    }
  }
};

// const userProject = (req, res) => {
//   try {
//     const user = res.locals.user;
//     if (user === undefined) {
//       res.status(400).send({ errorMessage: "로그인이 필요합니다." });
//     } else {
//       const { userId } = res.locals.user;
//       // FROM users A INNER JOIN projects B와 같이 A, B 잡아주는걸 가상 테이블 가상 칼럼 잡아준다고 한다.
//       // const sql = 'SELECT A.userId, B.projectId FROM users A INNER JOIN projects B on A.userId = B.userId where A.userId=?; '; + 'SELECT C.userId, D.resumeId FROM users C INNER JOIN resumes D on C.userID = D.userId where C.userId=?; ';
//       const sql =
//         "SELECT B.projectId FROM users A INNER JOIN projects B on A.userId = B.userId where A.userId=?; ";
//       const sql2 =
//         "SELECT C.resumeId FROM users A INNER JOIN resumes C on A.userID = C.userId where A.userId=?";
//       const sql_2 = mysql.format(sql2, userId);
//       db.query(sql + sql_2, userId, (err, result) => {
//         if (err) {
//           console.log(err);
//         }
//         res.status(200).send({ Projects: result[0], Resumes: result[1] });
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     return res
//       .status(400)
//       .send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
//   }
// };

module.exports = {
  signUp,
  checkUserId,
  checkNickname,
  login,
  refresh,
  userInfo,
  userDetail,
  updatePw,
};
