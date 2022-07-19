const express = require("express");
const router = express.Router();
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const authMiddleware = require("../../middlewares/authMiddleware");
const resumeController = require("./controllers/resume.controller");

// multer - S3 이미지 업로드 설정
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "jerryjudymary",
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, "resumeImage/" + Date.now() + "." + file.originalname.split(".").pop()); // 이름 설정
    },
  }),
});

// 이미지 업로드
router.post("/image", upload.single("resumeImage"), resumeController.resumeImage);

// 팀원 찾기 등록
router.post("/", authMiddleware, resumeController.resume);

// 팀원 찾기 전체 조회
router.get("/", resumeController.resumeInfo);

// 팀원 찾기 상세조회
router.get("/:resumeId", resumeController.resumeDetail);

// 팀원 찾기 정보 수정
router.put("/:resumeId", authMiddleware, resumeController.resumeUpdate);

// 팀원 찾기 정보 삭제
router.delete("/:resumeId", authMiddleware, resumeController.resumeDelete);

module.exports = router;
