const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const { v4 } = require("uuid");
const projectController = require("./controllers/project.controller")

// multer - S3 이미지 업로드 설정

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "jerryjudymary",
    acl: "public-read",
    key: function (req, file, cb) {
      // 이미지 파일 이름 설정
      cb(null, "projectImage/" + v4().toString().replace("-", "") + "." + file.originalname.split(".").pop());
    },
  }),
});

// 이미지 업로드

router.post("/photos", authMiddleware, upload.array("photos"), projectController.projectPhotos )

// 프로젝트 등록

router.post("/", authMiddleware, projectController.project);

// 프로젝트 조회

router.get("/", projectController.projectInfo);

// 프로젝트 상세 조회

router.get("/:projectId", projectController.projectDetail)

// 프로젝트 수정

router.put("/:projectId", authMiddleware, projectController.projectUpdate)

// 프로젝트 삭제

router.delete("/:projectId", authMiddleware, projectController.projectDelete)

module.exports = router;