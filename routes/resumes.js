const express = require("express");
const router = express.Router();
const moment = require("moment");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const authMiddleware = require("../middlewares/authMiddleware");
const db = require("../config/database");

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

// 팀원 찾기 등록
// router.post("/", authMiddleware, upload.single("resumeImage"), async (req, res) => {
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { content, email, phone, start, end, role, skills, content2, content3 } = req.body;
    // const resumeImage = req.file.location;

    // 이메일 형식 제한
    const re_email = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
    // 숫자(2~3자리) - 숫자(3~4자리) - 숫자(4자리)
    const re_phone = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/;
    // const start_date = moment(start).format("YYYY년 MM월 DD일");
    // const end_date = moment(end).format("YYYY년 MM월 DD일");

    if (email.search(re_email) == -1) return res.status(400).send({ errormessage: "이메일 형식이 아닙니다." });
    if (phone.search(re_phone) == -1) return res.status(400).send({ errormessage: "숫자(2~3자리) - 숫자(3~4자리) - 숫자(4자리)" });

    const skillsStr = JSON.stringify(skills);

    // moment 라이브러리를 활용하여 날짜 포멧 형식 지정
    const createdAt = moment().format("YYYY-MM-DD hh:mm:ss");

    const sql = `INSERT INTO resumes (userId, content, email, phone, start, end, role, skills, content2, content3, createdAt) 
    VALUES ('${userId}', '${content}', '${email}', '${phone}', '${start}', '${end}', '${role}', '${skillsStr}', '${content2}', '${content3}','${createdAt}')`;
    // VALUES ('${userId}', '${content}', '${email}', '${phone}', '${start}', '${end}', '${role}', '${skillsStr}', '${content2}', '${content3}','${resumeImage},'${createdAt}')`;

    await db.query(sql, (error, rows) => {
      if (error) throw error;
    });

    res.status(200).send({ message: "나의 정보를 등록 했습니다." });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errormessage: "작성란을 모두 기입해주세요." });
  }
});

// 팀원 찾기 전체 조회
router.get("/", async (req, res) => {
  try {
    // models에 timestamps를 이용하여 생성한 시간 기준 정렬
    // const resumes = await Resume.find({ skills, role }).sort({ createdAt: -1 });
    await db.query("SELECT * FROM resumes", (error, result, fields) => {
      if (error) throw error;
      const resumes = result;
      res.status(200).send({ resumes });
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
});

// 팀원 찾기 상세조회
router.get("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    await db.query(`SELECT * FROM resumes WHERE resumeId = ${resumeId}`, (error, result, fields) => {
      if (error) throw error;
      const resumes = result;
      res.status(200).send({ resumes });
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
});

// 팀원 찾기 정보 수정
// router.put("/:resumeId", authMiddleware, upload.single("resumeImage"), async (req, res) => {
router.put("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { userId } = res.locals.user;
    const { content, email, phone, start, end, role, skills, content2, content3 } = req.body;
    // const existResum = await Resume.findById(resumeId);
    const existResumid = `SELECT * FROM resumes WHERE userId = '${userId}'`;

    await db.query(existResumid, (error, result, fields) => {
      if (error) throw error;
      const [existResume] = result;

      if (userId !== existResume.userId) {
        return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });
      } else {
        const skillsStr = JSON.stringify(skills);
        // const resumeImage = req.file.location;

        const Resumesput = `UPDATE resumes SET content = '${content}', email = '${email}', phone = '${phone}', start = '${start}', end = '${end}',
        role = '${role}', skills = '${skillsStr}', content2 = '${content2}', content3 = '${content3}' WHERE resumeId = '${resumeId}' AND userId = '${userId}'`;
        // role='${role}', skills='${skillsStr}', content2='${content2}', content3='${content3}',resumeImage='${resumeImage}',WHERE resumeId='${resumeId} AND userId = '${userId}'`;

        db.query(Resumesput, (error, result, fields) => {
          if (error) throw error;
          res.status(200).send({ message: "나의 정보를 수정했습니다." });
        });
        // await Resume.findByIdAndUpdate(resumeId, { $set: { nickname, name, content, email, phone, start_date, end_date, role, skills, content2, content3, resumeImage } });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ errormessage: "작성란을 모두 기입해주세요." });
  }
});

// // 팀원 찾기 정보 프로필 이미지 수정
// router.put("/:resumeId/profileImage", authMiddleware, upload.single("profileImage"), async (req, res) => {
//   try {
//   } catch (error) {}
// });
// // 팀원 찾기 정보 프로필 이미지 삭제
// router.delete("/:resumeId/profileImage", authMiddleware, async (req, res) => {
//   try {
//   } catch (error) {}
// });

// 팀원 찾기 정보 삭제
router.delete("/:resumeId", authMiddleware, async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { userId } = res.locals.user;
    const existResumid = `SELECT * FROM resumes WHERE userId = '${userId}'`;

    await db.query(existResumid, (error, result, fields) => {
      if (error) throw error;
      const [existResum] = result;

      if (userId !== existResum.userId) {
        return res.status(400).send({ errormessage: "내 게시글이 아닙니다" });
      } else {
        const existResumdel = `DELETE FROM resumes WHERE resumeId = ${resumeId}`;

        db.query(existResumdel, (error, result, fields) => {
          if (error) throw error;
          res.status(200).send({ message: "나의 정보를 삭제했습니다." });
        });
        // await Resume.findByIdAndDelete(resumeId);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(401).send({ errormessage: "작성자만 삭제할 수 있습니다." });
  }
});

module.exports = router;
