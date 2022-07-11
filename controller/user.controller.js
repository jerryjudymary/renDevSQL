const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
require("dotenv").config();

const { User } = require("../models");

const db = require("../config/database");

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

const { postLoginSchema, postUsersSchema, postNicknameSchema, postUserIdSchema } = require("./validation.controller.js");

const signUp = async (req, res) => {
  try {
    var { password, passwordCheck, name, birth, policy } = await postUsersSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send({ errorMessage: "작성 형식을 확인해주세요" });
  }
  var { userId, nickname } = req.body;
  const profileImage = "";
  const refreshToken = "";

  if (userId && nickname && password && birth && name && passwordCheck === "") {
    res.status(400).send({ errorMessage: "작성란을 모두 기입해주세요." });
  }

  try {
    if (password === passwordCheck) {
      const [bcryptPw, idExist, nickExist] = await Promise.all([(password = bcrypt.hashSync(password, saltRounds)), User.findOne({ where: { userId } }), User.findOne({ where: { nickname } })]);

      if (!idExist && !nickExist) {
        const users = await User.create({ userId, nickname, password: bcryptPw, name, birth, policy, profileImage, refreshToken });

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
      return res.status(400).send({ errorMessage: "다시 한 번 시도해 주세요" });
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
      return res.status(400).send({ errorMessage: "다시 한 번 시도해 주세요" });
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

    if( userId !== users.userId){
      return res.status(400).send({ errorMessage: "아이디 또는 비밀번호가 일치하지 않습니다. "})
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
          sameSite: 'None',
          expires: new Date(Date.now() + 3600000 * 2)
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
          return res.status(200).send({ message: "토큰이 재발급 됐습니다.", token});
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

const updatePw = async (req, res) => {
  try {
    const { userId } = res.locals.user;
    if (userId === undefined) {
      return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    }
    let { password, newPassword } = req.body;
    const newHash = bcrypt.hashSync(newPassword, saltRounds)
    
    if(!newHash){
      return res.status(400).send({ errorMessage: "비밀번호 암호화에 실패했습니다."})
    }

    const { nickname } = req.params

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

const userDelete = async(req, res) => {
  
  const user = res.locals.user;
  const { nickname } = req.params
  var { password } = req.body;
  console.log(user.nickname)
  console.log(nickname)

  if(user === undefined){
    return res.status(401).send({ errorMessage: "로그인이 필요한 기능입니다."})
  } else if(user.nickname !== nickname ){
    return res.status(401).send({ errorMessage: "본인만 탈퇴할 수 있습니다."})
  }
  
  const users = await User.findOne({ where : { nickname } });
  
  if(users){
    

    if(!password && password === "" && password === undefined ){
      return res.status(401).send({ errorMessage: "비밀번호를 입력해 주세요"})
    }
    
    const hashed = bcrypt.compareSync(password, users.password);
    if(hashed){
      
      const ids = Math.random().toString(36).slice(-3) + "id";
      const nicks = Math.random().toString(36).slice(-3) + "nick";
      const names = ""
      const births = ""
      const profileImages = "" 
      const refreshTokens = ""
      const passwords = ""
      const passwordChecks  = ""
      
      await User.update
      ({
        userId: ids, nickname:nicks, name: names,
        birth: births, profileImage: profileImages,
        refreshToken: refreshTokens, password: passwords, passwordCheck: passwordChecks },
        { where : { nickname : user.nickname }
      });

      s3.deleteObject(
        {
        Bucket: "jerryjudymary",
        Key: users.profileImage,
        },
        (err, data) => {
        if (err) {
            console.log(err)
        }
        }
    );
      return res.status(200).send({ message: "정상적으로 회원 탈퇴 됐습니다."})
    } else {
      return res.status(401).send({ errorMessage: "비밀번호가 일치하지 않습니다."})
    }
  }
}

const profileImage = async (req, res) => {
  try {
    const profileImage = req.file.location;

    if (!profileImage) {
      return res.status(400).send({ errorMessage: "사진을 추가해 주세요" });
    }

    const { nickname } = req.params;

    const user = await User.findOne({ where : { nickname } });

      s3.deleteObject(
          {
          Bucket: "jerryjudymary",
          Key: user.profileImage,
          },
          (err, data) => {
          if (err) {
              console.log(err)
          }
          }
      );

    const updateImage = await User.update({ profileImage : profileImage }, { where: { nickname }})

  //   await User.update({ refreshToken }, { where: { userId } });

    return res.status(200).json({ message: "사진을 업로드 했습니다.", updateImage });
  } catch (err) {
    console.log(err);
    res.status(400).send({ errorMessage: "사진업로드 실패-파일 형식과 크기(1.5Mb 이하) 를 확인해주세요." });
  }
};

module.exports = {
  signUp,
  checkUserId,
  checkNickname,
  login,
  refresh,
  updatePw,
  userDelete,
  profileImage
};
