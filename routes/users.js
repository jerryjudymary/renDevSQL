const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middlewares/authMiddleware");

const { User, postUsersSchema, postLoginSchema } = require("../models/user");

router.post("/login", async (req, res) => {
  try {
    var { userId, password } = await postLoginSchema.validateAsync(req.body);
  } catch {
    return res.status(400).send({
      errorMessage: "아이디 또는 패스워드가 유효하지 않습니다.",
    });
  }

  const user = await User.findOne({ userId }).exec();

  if (!user) {
    return res.status(401).send({
      errorMessage: "존재하지 않는 유저입니다.",
    });
  }

  if (bcrypt.compareSync(password, user.password)) {
    const { userId, nickname } = user;
    const payload = { userId, nickname };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET_REFRESH, {
      expiresIn: "2d",
    });
    return res.status(200).send({
      message: "로그인 하셨습니다.",
      token,
      refreshToken,
    });
  } else {
    return res.status(400).send({
      errorMessage: "아이디나 또는 비밀번호가 일치하지 않습니다.",
    });
  }
});

router.post("/signup", async (req, res) => {
  try {
    var { userId, nickname, password, phone, birth, name, passwordCheck } = await postUsersSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).send({
      errorMessage: "작성 형식을 확인해주세요.",
    });
  }

  if (userId && nickname && password && phone && birth && name && passwordCheck === "") {
    res.status(400).send({ errorMessage: "작성란을 모두 기입해주세요." });
  }

  const oldUser = await User.find({ $or: [{ userId }, { nickname }] });

  if (oldUser.length) {
    return res.status(400).send({
      errorMessage: "중복된 아이디 또는 닉네임입니다.",
    });
  }

  if (password !== passwordCheck) {
    res.status(400).send({
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
    return;
  }
  const profileImage = "";
  // const policy = req.body;
  // if( policy !== true ){
  //   res.status(400).send({
  //     errorMessage: "약관에 동의해주시기 바랍니다."
  //   })
  // }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const user = new User({ userId, password: hash, nickname, birth, phone, name, profileImage });
    user.save();
    res.status(200).send({ message: "회원가입을 축하합니다." });
  } catch {
    return res.status(400).send({
      errorMessage: "회원가입에 실패하였습니다.",
    });
  }
});

router.get("/auth", authMiddleware, async (req, res) => {
  try {
    const user = res.locals.user;
    if (user === undefined) {
      res.status(401).json({ errorMessage: "로그인이 필요합니다." });
    } else {
      const existUser = await User.find();
      res.status(200).json(existUser);
    }
  } catch (err) {
    if (err) {
      console.log(err);
      res.status(400).json({ errorMessage: "유저 정보를 찾을 수 없습니다." });
    }
  }
});

router.get("/details/:nickname", authMiddleware, async (req, res) => {
  try {
    const user = res.locals.user;
    if (user === undefined) {
      return res.status(401).json({ errorMessage: "로그인이 필요합니다." });
    } else {
      const { nickname } = req.params;
      const existUser = await User.findOne({ nickname: nickname });
      return res.status(200).json(existUser);
    }
  } catch (err) {
    if (err) {
      console.log(err);
      res.status(400).json({ errorMessage: "유저 정보를 찾을 수 없습니다." });
    }
  }
});

// router.put('/details/:nickname/update', authMiddleware, async(req, res) => {
//   try{
//   const { nickname } = req.params
//   const { user } = res.locals.user
//   if( user.nickname !== nickname ) {
//     res.status(400).json({ errorMessage: "유저 정보를 찾을 수 없습니다." })
//   }
//   const { phone, birth, profileImage } = req.body;
//  } catch(err){
//   if(err){
//     res.status(400).json({ errorMessage:"회원정보를 수정하는데 실패했습니다." })
//   }
//  }

// })

module.exports = router;
