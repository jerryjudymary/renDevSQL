const express = require("express");
const router = express.Router();
const moment = require("moment");
const multer = require("multer");
const { Op } = require("sequelize");
const { User, Resume, ResumeSkill, sequelize } = require("../models");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const authMiddleware = require("../middlewares/authMiddleware");

// const moments = require("moment-timezone");
// const moments.tz.setDefault("Asia/Seoul");

// multer - S3 이미지 업로드 설정
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

// 이미지 업로드
// router.post("/image", upload.single("resumeImage"), async (req, res) => {
router.post("/image", authMiddleware, upload.single("resumeImage"), async (req, res) => {
  try {
    const resumeImage = req.file.location;
    return res.status(200).json({ message: "사진을 업로드 했습니다.", resumeImage });
  } catch (err) {
    console.log(err);
    res.status(400).send({ errorMessage: "사진업로드 실패-파일 형식과 크기(1.5Mb 이하) 를 확인해주세요." });
  }
});

// 팀원 찾기 등록
// router.post("/", authMiddleware, upload.single("resumeImage"), async (req, res) => {
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { id, nickname } = res.locals.user;
    const { content, email, phone, start, end, role, skill, content2, content3, resumeImage, exposeEmail, exposePhone } = req.body;
    if (!nickname) return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
    // const resumeImage = req.file.location;

    // 이메일 형식 제한
    const re_email = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    // 숫자(2~3자리) - 숫자(3~4자리) - 숫자(4자리)
    const re_phone = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/;

    if (email.search(re_email) == -1) return res.status(400).send({ errormessage: "이메일 형식이 아닙니다." });
    if (phone.search(re_phone) == -1) return res.status(400).send({ errormessage: "숫자(2~3자리) - 숫자(3~4자리) - 숫자(4자리)" });

    const createdAt = moment().format("YYYY-MM-DD hh:mm:ss");

    await Resume.create({ id, nickname, content, email, phone, start, end, role, content2, content3, resumeImage, exposeEmail, exposePhone, createdAt }).then((result) => {
      for (let i = 0; i < skill.length; i++) {
        ResumeSkill.create({ resumeId: result.resumeId, skill: skill[i] });
      }
    });

    res.status(200).send({ Resume, message: "나의 정보를 등록 했습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).send({ errormessage: "작성란을 모두 기입해주세요." });
  }
});

// 팀원 찾기 전체 조회
router.get("/", async (req, res) => {
  try {
    const resumes = await Resume.findAll(
      {
        // ResumeSkill 모델에서 skill를 찾은 후 resumes 에 담음
        include: [{ model: ResumeSkill, attributes: ["skill"] }],
        attributes: ["nickname", "resumeImage", "content", "start", "end", "role", "createdAt"],
        order: [["createdAt", "DESC"]],
        // offset: 3,
        limit: 9,
      } // 하나의 페이지 9개 조회
    );
    // console.log(resumes);

    // moment 라이브러리를 활용하여 날짜 포멧 형식 지정
    // const start_moment = moment(start).format("YYYY-MM-DD");
    // const end_moment = moment(end).format("YYYY-MM-DD");
    // const createdAt_moment = moment(createdAt).format("YYYY-MM-DD hh:mm:ss");

    res.status(200).send({ resumes });
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
});

// 팀원 찾기 상세조회
router.get("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { nickname } = res.locals.user;
    const { resumeId } = req.params;

    const resume = await Resume.findOne({
      include: [{ model: ResumeSkill, attributes: ["skill"] }],
      where: { resumeId },
    });

    if (!nickname) return res.status(401).send({ errorMessage: "로그인 후 사용하세요." });

    // moment 라이브러리를 활용하여 날짜 Format 형식
    // const start_moment = moment(start).format("YYYY-MM-DD");
    // const end_moment = moment(end).format("YYYY-MM-DD");

    res.status(200).send({ resume });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: "로그인 후 사용하세요" });
  }
});

// 팀원 찾기 정보 수정
// router.put("/:resumeId", authMiddleware, upload.single("resumeImage"), async (req, res) => {
router.put("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { id, nickname } = res.locals.user;
    const { resumeId } = req.params;
    const { content, email, phone, start, end, role, skill, content2, content3, resumeImage } = req.body;

    const existResume = await Resume.findOne({ where: { resumeId, nickname } });

    if (nickname !== existResume.nickname) {
      return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });
    } else {
      const tran = await sequelize.transaction(); // 트랙잭션 시작
      try {
        Resume.update({ nickname, content, email, phone, start, end, role, content2, content3, resumeImage }, { where: { resumeId, nickname } });
        // 등록 당시의 개수와 수정 당시의 개수가 다르면 update 사용 곤란으로 삭제 후 재등록 처리
        if (skill.length) {
          await ResumeSkill.destroy({ where: { resumeId }, transaction: tran });
          for (let i = 0; i < skill.length; i++) {
            await ResumeSkill.create({ resumeId, skill: skill[i] }, { transaction: tran });
          }
        }
        await tran.commit();
      } catch (error) {
        await tran.rollback(); // 트랜젝션 실패시 시작부분까지 되돌리기
      }
    }
    res.status(200).send({ message: "나의 정보를 수정했습니다." });
  } catch (error) {
    console.log(error);
    res.status(401).send({ errormessage: "작성란을 모두 기입해주세요." });
  }
});

// 팀원 찾기 정보 삭제
router.delete("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { id } = res.locals.user;
    const { resumeId } = req.params;
    if (!res.locals.user) return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });

    const existResume = await Resume.findOne({ include: [{ model: ResumeSkill, where: { resumeId } }] }, { where: { resumeId, id } });

    if (id !== existResume.id) {
      return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });
    } else {
      // if (existResume.resumeImage === resumeImage) {
      //   s3.deleteObject({
      //     bucket: "jerryjudymary",
      //     Key: existResume.resumeImage,
      //   });
      await existResume.destroy({});
    }

    res.status(200).send({ message: "나의 정보를 삭제했습니다." });
  } catch (error) {
    console.log(error);
    res.status(401).send({ errormessage: "작성자만 삭제할 수 있습니다." });
  }
});

module.exports = router;
