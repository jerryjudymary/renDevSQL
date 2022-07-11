const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();

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

const {
    signUp, checkUserId, checkNickname, login, refresh, updatePw, userDelete, profileImage
} = require("../controller/user.controller.js");

const {
    userInfo, userDetail, userProject, userResume, myApply, recruit
} = require("../controller/userInfo.controller.js")

const { 
    User,
}
= require("../models");

router.post("/signup", signUp); // 회원가입

router.post("/signup/checkUserId", checkUserId); //아이디 중복

router.post("/signup/checkNickname", checkNickname); // 닉네임 중복

router.post("/login", login); // 로그인

router.post("/refresh", refresh); // 토큰 재발급

router.get("/auth", authMiddleware, userInfo); // 유저 정보 조회

router.get("/details/:nickname", authMiddleware, userDetail); // 상세 정보 조회

router.get("/details/:nickname/projects", authMiddleware, userProject); // Project 조회

router.get("/details/:nickname/resumes", authMiddleware, userResume); // Resume 조회

router.get("/details/:nickname/apply", authMiddleware, myApply); // 내 지원현황 API

router.get("/details/:nickname/applys", authMiddleware, recruit); // 내 모집현황 API

router.put('/details/:nickname/updatepw', authMiddleware, updatePw); // 비밀번호 변경

router.put('/details/:nickname/delete', authMiddleware, userDelete); // 회원탈퇴

router.put(router.put("/details/:nickname/image", upload.single("profileImage"), authMiddleware, profileImage)) // 프로필 이미지 업로드

// router.delete('/details/:nickname/delete',  authMiddleware, deleteUser);

module.exports = router;
