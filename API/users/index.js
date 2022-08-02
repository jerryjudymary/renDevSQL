const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
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

const userController = require("../../API/users/controllers/user.controller")
const userInfoController = require("../../API/users/controllers/userInfo.controller")

const { User } = require("../../models");

router.post("/signup", userController.signUp); // 회원가입

router.post("/signup/checkUserId", userController.checkUserId); //아이디 중복

router.post("/signup/checkNickname", userController.checkNickname); // 닉네임 중복

router.post("/signup/checkEmail", userController.checkEmailNum); // 이메일 인증번호

router.post("/login", userController.login); // 로그인

router.get("/logout", userController.logout); // 로그아웃 시 쿠키 빈값으로 수정

// router.post("/refresh", userController.refresh); // 토큰 재발급

router.get("/auth", authMiddleware, userInfoController.userInfo); // 유저 정보 조회

router.get("/details/:nickname", authMiddleware, userInfoController.userDetail); // 상세 정보 조회

router.get("/details/:nickname/projects", authMiddleware, userInfoController.userProject); // Project 조회

router.get("/details/:nickname/resumes", authMiddleware, userInfoController.userResume); // Resume 조회

router.get("/details/:nickname/apply", authMiddleware, userInfoController.myApply); // 내 지원현황 API

router.get("/details/:nickname/applys", authMiddleware, userInfoController.recruit); // 내 모집현황 API

router.put("/details/:nickname/updatepw", authMiddleware, userController.updatePw); // 비밀번호 변경

router.put("/details/:nickname/delete", authMiddleware, userController.userDelete); // 회원탈퇴

router.put("/details/:nickname/image", upload.single("profileImage"), authMiddleware, userController.profileImage); // 프로필 이미지 업로드

// router.delete('/details/:nickname/delete',  authMiddleware, deleteUser);

module.exports = router;
