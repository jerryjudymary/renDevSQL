const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Op } = require("sequelize");
const { User, Resume, ResumeSkill, sequelize } = require("../models");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const logger = require("../config/logger");
const s3 = new aws.S3();
const authMiddleware = require("../middlewares/authMiddleware");
const { redisClient, DEFAULT_EXPIRATION } = require("../config/redis");

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
router.post("/image", upload.single("resumeImage"), async (req, res) => {
  try {
    const resumeImage = req.file.location;
    return res.status(200).json({ message: "사진을 업로드 했습니다.", resumeImage });
  } catch (err) {
    logger.error(err);
    res.status(400).send({ errorMessage: "사진업로드 실패-파일 형식과 크기(1.5Mb 이하) 를 확인해주세요." });
  }
});

// 팀원 찾기 등록
router.post("/", authMiddleware, async (req, res) => {
  const { id, userId, nickname } = res.locals.user;
  const { content, start, end, role, skill, resumeImage, content2, content3 } = req.body;

  if (!userId) return res.status(401).send({ errorMessage: "로그인 후 사용하세요." });

  if (!content || !start || !end || !role || !skill || !content2 || !content3) return res.status(400).send({ errorMessage: "작성란을 모두 기입해주세요." });

  if (start >= end) return res.status(400).send({ errorMessage: "날짜 형식이 잘못되었습니다." });

  try {
    const createdAt = new Date();

    await Resume.create({ id, userId, nickname, content, start, end, role, content2, content3, resumeImage, createdAt }).then((result) => {
      for (let i = 0; i < skill.length; i++) {
        ResumeSkill.create({ resumeId: result.resumeId, skill: skill[i] });
      }
    });

    redisClient.del(`resumes`, function (err, response) {
      if (response == 1) console.log("새 지원서 등록으로 전체조회 캐시 삭제");
    });

    res.status(200).send({ message: "나의 정보를 등록 했습니다." });
  } catch (err) {
    logger.error(err);
    res.status(400).send({ errormessage: "등록 실패" });
  }
});

// 팀원 찾기 전체 조회
router.get("/", async (req, res) => {
  redisClient.get("resumes", async (err, data) => {
    // 레디스 서버에서 데이터 체크, 레디스에 저장되는 키 값은 projects
    if (err) logger.error(error);
    if (data) return res.status(200).json({ returnResumes: JSON.parse(data) }); // 캐시 적중(cache hit)시 response!
    try {
      const resumes = await Resume.findAll({
        //   // ResumeSkill 모델에서 skill를 찾은 후 resumes 에 담음
        include: [
          {
            model: ResumeSkill,
            attributes: ["skill"],
          },
        ],
        // offset: 3,
        // limit: 9, // 하나의 페이지 9개 조회
        order: [["createdAt", "DESC"]],
      });
      // [{skill},{skill}]부분을 -> [skill,skill]로 map함수를 사용하여 새로 정의
      const resumeskills = resumes.map((resume) => resume.ResumeSkills.map((skill) => skill["skill"]));

      let returnResumes = [];

      resumes.forEach((resume, index) => {
        let a_resume = {};
        a_resume.resumeId = resume.resumeId;
        a_resume.nickname = resume.nickname;
        a_resume.resumeImage = resume.resumeImage;
        a_resume.content = resume.content;
        a_resume.start = resume.start;
        a_resume.end = resume.end;
        a_resume.role = resume.role;
        a_resume.resumeskills = resumeskills[index];
        a_resume.createdAt = resume.createdAt;

        returnResumes.push(a_resume);
      });

      // 캐시 부적중(cache miss)시 DB에 쿼리 전송, setex 메서드로 설정한 기본 만료시간까지 redis 캐시 저장
      redisClient.setex("resumes", DEFAULT_EXPIRATION, JSON.stringify(returnResumes));
      res.status(200).send({ returnResumes });
    } catch (error) {
      logger.error(err);
      res.status(400).send({});
    }
  });
});

// 팀원 찾기 상세조회
router.get("/:resumeId", async (req, res) => {
  const { resumeId } = req.params;
  // 레디스 서버에서 데이터 체크, 레디스에 저장되는 키 값은 projects
  redisClient.get(`resumes:${resumeId}`, async (err, data) => {
    if (err) logger.error(err);
    if (data) return res.status(200).json({ resumes: JSON.parse(data) }); // 캐시 적중(cache hit)시 response!

    try {
      const existresumes = await Resume.findOne({
        include: [
          {
            model: ResumeSkill,
            attributes: ["skill"],
          },
        ],
        where: { resumeId },
      });
      // map을 이용하여 배열 안에 객체
      const resumeskills = existresumes.ResumeSkills.map((skills) => skills.skill);

      const resumes = {
        resumeId: existresumes.resumeId,
        userId: existresumes.userId,
        nickname: existresumes.nickname,
        content: existresumes.content,
        start: existresumes.start,
        end: existresumes.end,
        role: existresumes.role,
        content2: existresumes.content2,
        content3: existresumes.content3,
        resumeImage: existresumes.resumeImage,
        resumeskills,
      };

      // 캐시 부적중(cache miss)시 DB에 쿼리 전송, setex 메서드로 설정한 기본 만료시간까지 redis 캐시 저장
      redisClient.setex(`resumes:${resumeId}`, DEFAULT_EXPIRATION, JSON.stringify(resumes));
      res.status(200).send({ resumes });
    } catch (error) {
      logger.error(err);
      res.status(400).send({ errorMessage: "정보가 존재하지 않습니다." });
    }
  });
});

// 팀원 찾기 정보 수정
router.put("/:resumeId", authMiddleware, async (req, res) => {
  const { userId } = res.locals.user;
  const { resumeId } = req.params;
  const { content, start, end, role, skill, content2, content3, resumeImage } = req.body;

  const existResume = await Resume.findOne({ where: { resumeId } });

  if (userId !== existResume.userId) return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });

  if (!content || !start || !end || !role || !skill || !content2 || !content3) return res.status(400).send({ errorMessage: "작성란을 모두 기입해주세요" });

  if (start >= end) return res.status(400).send({ errorMessage: "날짜 형식이 잘못되었습니다." });

  const tran = await sequelize.transaction(); // 트랙잭션 시작

  try {
    existResume.update({ content, start, end, role, content2, content3, resumeImage }, { where: { resumeId } });
    // 등록 당시의 개수와 수정 당시의 개수가 다르면 update 사용 곤란으로 삭제 후 재등록 처리
    if (skill.length) {
      await ResumeSkill.destroy({ where: { resumeId }, transaction: tran });
      for (let i = 0; i < skill.length; i++) {
        await ResumeSkill.create({ resumeId, skill: skill[i] }, { transaction: tran });
      }
    }
    res.status(200).send({ message: "나의 정보를 수정했습니다." });
    await tran.commit();

    // 수정시 해당 지원서, 전체조회 캐싱용 Redis 키 삭제
    redisClient.del(`resumes:${resumeId}`, `resumes`, function (err, response) {
      if (response == 1) console.log("1 Redis key deleted");
      if (response == 2) console.log("2 Redis key deleted");
    });
  } catch (error) {
    logger.error(error);
    res.status(401).send({ errormessage: "정보 수정 실패" });
    await tran.rollback(); // 트랜젝션 실패시 시작부분까지 되돌리기
  }
});

// 팀원 찾기 정보 삭제
router.delete("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { resumeId } = req.params;

    if (!userId) return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });

    const existResume = await Resume.findOne({ include: [{ model: ResumeSkill, where: { resumeId } }], where: { resumeId } });

    if (userId !== existResume.userId) {
      return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });
    } else {
      // if (existResume.resumeImage === resumeImage) {
      //   s3.deleteObject(
      //     {
      //       bucket: "jerryjudymary",
      //       Key: "resumeImage/" + existResume.resumeImage,
      //     },
      //     (err, data) => {
      //       if (err) {
      //         throw err;
      //       }
      //       console.log("s3 deleteObject ", data);
      //     }
      //   );
      console.log(existResume.resumeImage);
      await existResume.destroy({});

      // 수정시 해당 지원서, 전체조회 캐싱용 Redis 키 삭제
      redisClient.del(`resumes:${resumeId}`, `resumes`, function (err, response) {
        if (response == 1) console.log("1 Redis key deleted");
        if (response == 2) console.log("2 Redis key deleted");
      });
    }
    // }
    res.status(200).send({ message: "나의 정보를 삭제했습니다." });
  } catch (error) {
    logger.error(error);
    res.status(401).send({ errormessage: "작성자만 삭제할 수 있습니다." });
  }
});

module.exports = router;
