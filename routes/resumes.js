const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();
const Resume = require("../models/resume");
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
      cb(null, "projectImage/" + Date.now() + "." + file.originalname.split(".").pop()); // 이름 설정
    },
  }),
});

// 개발자 정보 등록
router.post("/", authMiddleware, upload.single("resumesImage"), async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { title, content, content2, content3, start, end, role, skills, email, phone } = req.body;
    // const resumesImage = req.files.location; 와이어 프레임 완성전 까지 보류
    const dev = await Resume.create({ userId, title, content, content2, content3, start, end, role, skills, email, phone });

    res.status(200).send({ dev, message: "나의 정보를 등록 했습니다." });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errormessage: "작성란을 모두 기입해주세요." });
  }
});

// 개발자 정보 전체 조회
router.get("/", async (req, res) => {
  try {
    const { skills, role } = req.query;
    // models에 timestamps를 이용하여 생성한 시간 기준 정렬
    const resumes = await Resume.find({ skills, role }).sort({ createdAt: -1 });

    res.status(200).send({ resumes });
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
});

// 개발자 상세조회
router.get("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resumesId = await Resume.findById(resumeId);

    res.status(200).send({ resumesId });
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
});

// 개발자 정보 수정
router.put("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { userId } = res.locals.user;
    const { title, content, content2, content3, start, end, role, skills, email, phone } = req.body;
    const existResum = await Resume.findById(resumeId);

    if (userId !== existResum.userId) {
      return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });
    } else {
      await Resume.findByIdAndUpdate(resumeId, { $set: { title, content, content2, content3, start, end, role, skills, email, phone } });
    }

    res.status(200).send({ message: "나의 정보를 수정했습니다." });
  } catch (error) {
    console.log(error);
    res.status(401).send({ errormessage: "작성란을 모두 기입해주세요." });
  }
});

// 개발자 정보 삭제
router.delete("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { userId } = res.locals.user;
    const existResum = await Resume.findById(resumeId);

    if (userId !== existResum.userId) {
      return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });
    } else {
      await Resume.findByIdAndDelete(resumeId);
    }

    res.status(200).send({ message: "나의 정보를 삭제했습니다." });
  } catch (error) {
    console.log(error);
    res.status(401).send({ errormessage: "작성자만 삭제할 수 있습니다." });
  }
});

module.exports = router;
