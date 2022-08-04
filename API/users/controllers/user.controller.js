const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
require("dotenv").config();
const { User, sequelize } = require("../../../models");
const { QueryTypes } = require("sequelize");
const sendMail = require('../../../config/mail');

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "jerryjudymary",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, "profileImage/" + Date.now() + "." + file.originalname.split(".").pop()); // 이름 설정
    },
  }),
});

const { postLoginSchema, postUsersSchema, postNicknameSchema, postUserIdSchema } = require("../controllers/userValidation.controller");

exports.signUp = async (req, res) => {
  try {
    var { password, passwordCheck, policy } = await postUsersSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send({ errorMessage: "작성 형식을 확인해주세요" });
  }
  var { userId, nickname, code } = req.body;
  const profileImage = "";
  const refreshToken = "";

  if (userId === "" || nickname === "" || password === "" || passwordCheck === "") {
    res.status(400).send({ errorMessage: "작성란을 모두 기입해주세요." });
  }
  
  const sql = `SELECT * FROM email WHERE userId='${userId}'`;
  const sql2 = `DELETE FROM email WHERE userId='${userId}'`
  
  try {
    if (password === passwordCheck) {
      const [bcryptPw, idExist, nickExist, query] = await Promise.all([
        (password = bcrypt.hashSync(password, saltRounds)),
        User.findOne({ where: { userId } }),
        User.findOne({ where: { nickname } }),
        sequelize.query(sql, { type: QueryTypes.SELECT })
      ]);

      const checkEmail = query.map(data => data.code).toString()

      if (code  === undefined || code === null || !code) {
        return res.status(400).send({ errorMessage: "인증번호를 입력해 주세요" })
      }

      if (code !== checkEmail) {
        return res.status(400).send({ errorMessage: "인증번호를 확인해 주세요"})
      }

      if (!idExist && !nickExist) {
        const users =
        await User.create({ userId, nickname, password: bcryptPw, policy, profileImage, refreshToken });
        await sequelize.query(sql2 ,{type:sequelize.QueryTypes.DELETE});
        res.status(200).send({ users: users, message: "회원가입을 축하합니다." });
      } else if (idExist) {
        return res.status(400).send({ errorMessage: "중복 검사가 필요합니다." });
      } else if (nickExist) {
        return res.status(400).send({ errorMessage: "중복 검사가 필요합니다." });
      }} else {
      return res.status(400).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
    }
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ errorMessage: "회원가입에 실패했습니다." });
    }
  }
};

exports.checkUserId = async (req, res) => {
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
      var emailNum = Math.random().toString(36).slice(-5)
      sendMail
          .sendMail({
            from: `renDev <${process.env.NODEMAILER_USER}>`,
            to: userId,
            subject: 'renDev 인증번호가 도착했습니다.',
            text: `사람과 미지의 조우 renDev입니다.`,
            html: `
            <div style="text-align: center;">
            <img src=https://desklet.s3.ap-northeast-2.amazonaws.com/renDevvvvvvvvvvvvv.png>
              <h1 style="color: #ECE0F8"></h1>
              <br />
              <h2>이메일 인증번호는 ${emailNum} 입니다.
              </h2>
            </div>
          `,
          })
      };
      const sql3 = `SELECT MAX(code) FROM email WHERE userId='${userId}'`
      const existUser = await sequelize.query(sql3, { type: sequelize.QueryTypes.SELECT})
      console.log(existUser)
      if(existUser){
      const sql2 = `DELETE FROM email WHERE userId='${userId}'`
      await sequelize.query(sql2, { type: sequelize.QueryTypes.DELETE })
      const sql = `INSERT INTO email (userId, code) VALUES ('${userId}', '${emailNum}');`;
      await sequelize.query(sql, { type: sequelize.QueryTypes.INSERT })}
      else {
      const sql = `INSERT INTO email (userId, code) VALUES ('${userId}', '${emailNum}');`;
      await sequelize.query(sql, { type: sequelize.QueryTypes.INSERT })
      }
      return res.status(200).send({ message: "사용 가능한 아이디 입니다. 메일이 발송 되었습니다." });
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(400).send({ errorMessage: "다시 한 번 시도해 주세요" });
    }
  }
};

exports.checkNickname = async (req, res) => {
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
      return res.status(400).send({ errorMessage: "다시 한 번 시도해 주세요" });
    }
  }
};

exports.checkEmailNum = async (req, res) => {
  try{
    const { code, userId } = req.body

    if(code === "" || code === undefined || code === null || !code){
      return res.status(400).send({ errorMessage: "인증번호를 입력해 주세요"})
    }
    const sql = `SELECT * FROM email where userId='${userId}'`
    const query = await sequelize.query(sql, { type: QueryTypes.SELECT })
    const querys = query.map(data => data.code);
    const checkEmail = querys.reduce(function (acc, cur) {
      return acc.concat(cur);
    });
    
    if(code === checkEmail){
      return res.status(200).send({ message: "인증번호가 일치합니다."});
    } else {
      return res.status(400).send({ errorMessage: "인증번호가 일치하지 않습니다." })
    }
  }catch(err){
    console.log(err)
    return res.status(400).send({ errorMessage: "인증번호가 일치하지 않습니다."})
  }
}

exports.login = async (req, res) => {
  try {
    var { userId, password } = await postLoginSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send({ errorMessage: "아이디 또는 패스워드가 유효하지 않습니다." });
  }

  try {
    const users = await User.findOne({ where: { userId } });

    if (userId !== users.userId) {
      return res.status(400).send({ errorMessage: "아이디 또는 비밀번호가 일치하지 않습니다. " });
    }

    if (users) {
      const hashed = bcrypt.compareSync(password, users.password);

      if (!hashed) {
        return res.status(400).send({ errorMessage: "아이디 또는 비밀번호가 일치하지 않습니다." });
      } else if (!users) {
        return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다." });
      } else {
        const payload = {
          userId: users.userId,
          nickname: users.nickname,
          profileImage: users.profileImage,
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
          expiresIn: "2h",
        });

        const refreshToken = jwt.sign(payload, process.env.JWT_SECRET_REFRESH, {
          expiresIn: "2d",
        });

        await User.update({ refreshToken }, { where: { userId } });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "None", secure: true });
        // res.cookie("refreshToken", refreshToken);
        return (
          res
            .status(200)
            // cookie("refreshToken", refreshToken, { httpOnly : true, sameSite: 'None', secure: true }).
            .send({ message: "로그인 하셨습니다.", token, nickname: users.nickname })
        );
      }
    }
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(401).send({ errorMessage: "아이디 또는 비밀번호가 일치하지 않습니다." });
    }
  }
};

exports.logout = async (req, res) => {
  const refresh = req.cookies.refreshToken

  if(refresh){
    return res.cookie("refreshToken","", { httpOnly: true, sameSite: "None", secure: true })
    .status(200).send({ message : "로그아웃에 성공 하셨습니다."})
  } else {
    return res.status(400).send({ errorMessage: "로그아웃에 실패 했습니다."})
  }
}


// exports.refresh = async (req, res) => {
//   console.log("refreshToken:", req.cookies.refreshToken)

//   const refreshToken = req.cookies.refreshToken;

//   console.log("refresh 입니다: ", refreshToken);

//   if (!refreshToken) {
//     return res.status(401).send({ errorMessage: "Token is expired" });
//   }

//   const users = await User.findAll({ where: { refreshToken } });

//   try {
//     if (!users) {
//       return res.status(401).json({ errorMessage: "refreshToken is unvalidate" });
//     } else {
//       jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH, (err, data) => {
//         if (err) {
//           return res.status(403).send({ errorMessage: "refreshToken is unvalidate" });
//         } else {
//           const payload = {
//             userId: refreshToken.userId,
//             nickname: refreshToken.nickname,
//           };
//           const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//             expiresIn: "1h",
//           });
//           return res.status(200).send({ message: "토큰이 재발급 됐습니다.", token });
//         }
//       });
//     }
//   } catch (err) {
//     if (err) {
//       console.log(err);
//       return res.status(401).send({ errorMessage: "refreshToken is unvalidate" });
//     }
//   }
// };

exports.updatePw = async (req, res) => {
  try {
    const { userId } = res.locals.user;
    if (userId === undefined) {
      return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    }
    let { password, newPassword } = req.body;
    const newHash = bcrypt.hashSync(newPassword, saltRounds);

    if (!newHash) {
      return res.status(400).send({ errorMessage: "비밀번호 암호화에 실패했습니다." });
    }

    const { nickname } = req.params;

    const users = await User.findOne({ where: { nickname } });
    if (!users) {
      return res.status(401).send({ errorMessage: "비밀번호를 확인해 주세요" });
    } else {
      const hashed = bcrypt.compareSync(password, users.password);
      if (!hashed) {
        return res.status(401).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
      } else {
        await User.update({ password: newHash }, { where: { nickname } });
        return res.status(200).send({ message: "비밀번호 변경에 성공했습니다." });
      }
    }
  } catch (err) {
    if (err) {
      console.log(err);
      res.status(400).send({ errorMessage: "비밀번호를 확인해 주세요" });
    }
  }
};

exports.sendEmailPasswordcode = async(req, res) => {
  try{
    const { userId } = req.body;

    if(userId){
      const sql = `SELECT * FROM user WHERE userId='${userId}'`
      const query = await sequelize.query(sql, { type: QueryTypes.SELECT })
      const existId = query.map(data => data.userId)
      sendMail
            .sendMail({
              from: `renDev <${process.env.NODEMAILER_USER}>`,
              to: existId,
              subject: 'renDev 인증번호가 도착했습니다.',
              text: `사람과 미지의 조우 renDev입니다.`,
              html: `
              <div style="text-align: center;">
              <img src=https://desklet.s3.ap-northeast-2.amazonaws.com/renDevvvvvvvvvvvvv.png>
                <h1 style="color: #ECE0F8"></h1>
                <br />
                <h2>이메일 인증번호는 ${emailNum} 입니다.
                </h2>
              </div>
            `,
            })
      const sql3 = `SELECT MAX(code) FROM email WHERE userId='${userId}'`
      const existUser = await sequelize.query(sql3, { type: sequelize.QueryTypes.SELECT})
      
      if(existUser){
        const sql2 = `DELETE FROM email WHERE userId='${existId}'`
        await sequelize.query(sql2, { type: sequelize.QueryTypes.DELETE })
        const sql3 = `INSERT INTO email (userId, code) VALUES ('${existId}', '${emailNum}');`;
        await sequelize.query(sql3, { type: sequelize.QueryTypes.INSERT })}
        else {
        const sql4 = `INSERT INTO email (userId, code) VALUES ('${existId}', '${emailNum}');`;
        await sequelize.query(sql4, { type: sequelize.QueryTypes.INSERT })
        }
      return res.status(200).send({ message : "인증번호가 메일로 전송 됐습니다."})
    } else {
      return res.status(400).send({ errorMessage: "아이디를 입력해 주세요"})
    }
  }catch(err){
    console.log(err)
    return res.status(400).send({ errorMessage: "아이디를 입력해 주세요"})
  }
}

exports.findPassword = async(req, res) => {
  try{
    var { code, userId, findPassword, findPasswordCheck } = req.body;

    const sql = `SELECT * FROM email WHERE userId='${userId}'`;
    const query = await sequelize.query(sql, { type: QueryTypes.SELECT });
    const emailCode = query.map(data => data.code);

    if( code === emailCode ){
      if(findPassword === findPasswordCheck){
        const hashPassword = bcrypt.hashSync(findPassword, saltRounds)
        await User.update({ password: hashPassword }, { where: { userId : userId } });
        return res.status(200).send({ message: "비밀번호가 변경 됐습니다." })
      }
    }else {
      return res.status(400).send({ errorMessage: "인증번호가 일치하지 않습니다." })
    }
  }catch(err){
    console.log(err)
    return res.status(400).send({ errorMessage: "비밀번호가 일치하는지 확인해 주세요"})
  }
}

exports.userDelete = async (req, res) => {
  const user = res.locals.user;
  const { nickname } = req.params;
  var { password } = req.body;

  if (user === undefined) {
    return res.status(401).send({ errorMessage: "로그인이 필요한 기능입니다." });
  } else if (user.nickname !== nickname) {
    return res.status(401).send({ errorMessage: "본인만 탈퇴할 수 있습니다." });
  }

  const users = await User.findOne({ where: { nickname } });

  if (users) {
    if (!password || password === "" || password === undefined) {
      return res.status(401).send({ errorMessage: "비밀번호를 입력해 주세요" });
    }

    const hashed = bcrypt.compareSync(password, users.password);
    if (hashed) {
      const ids = Math.random().toString(36).slice(-3) + "id";
      const nicks = Math.random().toString(36).slice(-3) + "nick";
      const profileImages = "";
      const refreshTokens = "";
      const passwords = "";
      const passwordChecks = "";

      await User.update(
        {
          userId: ids,
          nickname: nicks,
          profileImage: profileImages,
          refreshToken: refreshTokens,
          password: passwords,
          passwordCheck: passwordChecks,
        },
        { where: { nickname: user.nickname } }
      );

      s3.deleteObject(
        {
          Bucket: "jerryjudymary",
          Key: users.profileImage,
        },
        (err, data) => {
          if (err) {
            console.log(err);
          }
        }
      );
      return res.cookie("refreshToken","" , { httpOnly: true, sameSite: "None", secure: true }).
      status(200).send({ message: "정상적으로 회원 탈퇴 됐습니다." });
    } else {
      return res.status(401).send({ errorMessage: "비밀번호가 일치하지 않습니다." });
    }
  }
};

exports.profileImage = async (req, res) => {
  try {
    const profileImage = req.file.location;

    if (!profileImage) {
      return res.status(400).send({ errorMessage: "사진을 추가해 주세요" });
    }

    const { nickname } = req.params;

    const updateImage = await User.update({ profileImage: profileImage }, { where: { nickname } });

    // await User.update({ refreshToken }, { where: { userId } });

    return res.status(200).json({ message: "사진을 업로드 했습니다.", updateImage });
  } catch (err) {
    console.log(err);
    res.status(400).send({ errorMessage: "사진업로드 실패-파일 형식과 크기(1.5Mb 이하) 를 확인해주세요." });
  }
};
