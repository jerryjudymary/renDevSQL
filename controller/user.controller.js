const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
require("dotenv").config();

// const dbConfig = require('../config/database.js');
// const db = mysql.createConnection(dbConfig);
const db = require("../config/database");

const { postLoginSchema, postUsersSchema, postNicknameSchema, postUserIdSchema } = require("./validation.controller.js");

const signUp = async (req, res) => {
  console.log(req.body);
  try {
    var { userId, nickname, password, passwordCheck, name, birth, phone, policy } = await postUsersSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send({ errorMessage: "작성 형식을 확인해주세요" });
  }
  const profileImage = "";
  const refreshToken = "";
  const projects = JSON.stringify(["project1", "project2"]);
  const resumes = JSON.stringify([" resume1, resume2"]);
  const myApplicants = JSON.stringify([
    {
      project1: ["user1", "user2"],
    },
    {
      project2: ["user3", "user1"],
    },
  ]);
  const myApplications = JSON.stringify(["project1", "project2"]);

  if (userId && nickname && password && phone && birth && name && passwordCheck === "") {
    res.status(400).send({ errorMessage: "작성란을 모두 기입해주세요." });
  }

  const users = "INSERT INTO users (`userId`,`nickname`,`password`,`name`,`birth`,`phone`,`profileImage`, `policy`, `refreshToken`, `projects`, `resumes`, `myApplicants`, `myApplications` ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

  if (password !== passwordCheck) {
    res.status(400).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
  }

  let sql = [userId, nickname, password, name, birth, phone, profileImage, policy, refreshToken, projects, resumes, myApplicants, myApplications];
  bcrypt.hash(sql[2], saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
      res.status(400).send({ errorMessage: "hash에 실패했습니다." });
    } else {
      sql[2] = hash;
      db.query(users, sql, (err, result) => {
        if (err) {
          console.log(err);
          res.status(400).send({ errorMessage: "중복된 아이디 또는 닉네임 입니다." });
        } else {
          console.log(result);
          res.status(200).send({ message: "회원가입을 축하합니다." });
        }
      });
    }
  });
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
  const sql2 = "SELECT * FROM users where userId=?";
  try {
    db.query(sql2, userId, function (err, result, fields) {
      if (result.length === 0) {
        console.log(result);
        console.log(err);
        return res.send({ message: "사용 가능한 아이디 입니다." });
      } else {
        return res.status(400).send({ errorMessage: "중복된 아이디 입니다." });
      }
    });
  } catch (err) {
    return res.status(400).send({ errorMessage: "다시 한 번 시도해 주세요" });
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
  const sql3 = "SELECT * FROM users where nickname=?";
  try {
    db.query(sql3, nickname, function (err, result, fields) {
      if (result.length === 0) {
        if (err) {
          console.log(err);
        }
        return res.send({ message: "사용 가능한 닉네임 입니다." });
      } else {
        res.status(400).send({ errorMessage: "중복된 닉네임 입니다." });
      }
    });
  } catch (err) {
    return res.status(400).send({ errorMessage: "다시 한 번 시도해 주세요" });
  }
};

const login = async (req, res) => {
  try {
    var { userId, password } = await postLoginSchema.validateAsync(req.body);
  } catch (err) {
    res.status(400).send({ errorMessage: "아이디 또는 패스워드가 유효하지 않습니다." });
  }

  try {
    const sql1 = "SELECT * FROM users WHERE userId=?";

    db.query(sql1, userId, (err, data) => {
      if (data.length) {
        console.log(data);
        bcrypt.compare(password, data[0].password, (err, result) => {
          if (result) {
            console.log("sadsadd", data[0].password);
            const payload = {
              userId: data[0].userId,
              nickname: data[0].nickname,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
              expiresIn: "1h",
            });
            const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
              expiresIn: "1d",
            });
            const sql2 = "UPDATE users SET refreshToken=? where userId=?";
            db.query(sql2, [refreshToken, userId], (err, data) => {
              if (err) {
                console.log(err);
              }
            });
            // refresh token은 cookie에 직접 넣어서 전달,
            // access token은 FE에 직접 send로 내보내기
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
            });
            res.status(200).send({
              message: "로그인 하셨습니다.",
              token,
            });
          }
        });
      } else {
        if (data.length === 0 || err) {
          console.log(err);
          res.status(400).send({ errorMessage: "존재하지 않는 유저입니다." });
        }
      }
    });
  } catch (err) {
    console.log(err);
    res.status(401).send({ errorMessage: "아이디나 또는 비밀번호가 일치하지 않습니다." });
  }
};

const refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);
  if (!refreshToken) {
    return res.status(401).send({ errorMessage: "Token is expired" });
  }

  const userId = refreshToken;
  const sql = "SELECT * FROM users WHERE userId=?";
  try {
    db.query(sql, userId, (err, data) => {
      if (err) {
        console.log(err);
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
            res.status(200).send({
              message: "토큰이 재발급 됐습니다.",
              token,
            });
          }
        });
      }
    });

    jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, user) => {
      if (err) {
        return res.status(403).send({ errorMessage: "Token is unvalidate" });
      } else {
        const payload = {
          userId: refreshToken.userId,
          nickname: refreshToken.nickname,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "1h",
        });
        res.send(token);
      }
    });
  } catch (err) {
    if (err) {
      res.status(400).send({ errorMessage: "refreshToken is unvalidate" });
    }
  }
};

const userDetail = (req, res) => {
  try {
    const user = res.locals.user;
    if (user === undefined) {
      res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    } else {
      const { nickname } = req.params;
      const sql = "SELECT * FROM users where nickname=?";
      db.query(sql, nickname, function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        res.send(result);
      });
    }
  } catch (err) {
    if (err) {
      console.log(err);
      res.status(400).send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
    }
  }
};

const userInfo = (req, res) => {
  try {
    const user = res.locals.user;
    if (user === undefined) {
      res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    } else {
      const { userId } = res.locals.user;
      const sql = "SELECT * FROM users where userId=?";
      db.query(sql, userId, function (err, result, fields) {
        if (err) {
          console.log(err);
        }
        res.status(200).send({ userId: result[0].userId, nickname: result[0].nickname });
      });
    }
  } catch (err) {
    res.status(400).send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
  }
};

module.exports = {
  signUp,
  checkUserId,
  checkNickname,
  login,
  refresh,
  userInfo,
  userDetail,
};
