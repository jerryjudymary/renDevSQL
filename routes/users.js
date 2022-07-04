const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const { signUp, checkUserId, checkNickname, login, refresh, userInfo, userDetail } = require("../controller/user.controller.js");

router.post("/signup", signUp); // 회원가입

router.post("/signup/checkUserId", checkUserId); //아이디 중복

router.post("/signup/checkNickname", checkNickname); // 닉네임 중복

router.post("/login", login); // 로그인

router.post("/refresh", refresh); // 토큰 재발급

router.get("/auth", authMiddleware, userInfo); // 유저 정보 조회

router.get("/details/:nickname", authMiddleware, userDetail); // 상세 정보 조회

// router.delete('/details/:nickname/delete',  authMiddleware, deleteUser);

module.exports = router;
