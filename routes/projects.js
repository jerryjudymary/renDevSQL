const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { projectPostSchema } = require("../models/project");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
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

// 전역변수로 시간 설정, 출력 예제) 1999-09-09 09:09:09

const now = new Date();
const years = now.getFullYear();
const months = now.getMonth();
const dates = now.getDate();
const hours = now.getHours();
const minutes = now.getMinutes();
const seconds = now.getSeconds();
const createdAt =
  `${years < 10 ? `0${years}` : `${years}`}` + "-" + `${months < 10 ? `0${months}` : `${months}`}` + "-" + `${dates < 10 ? `0${dates}` : `${dates}`}` + " " + `${hours < 10 ? `0${hours}` : `${hours}`}` + ":" + `${minutes < 10 ? `0${minutes}` : `${minutes}`}` + ":" + `${seconds < 10 ? `0${seconds}` : `${seconds}`}`;

// 이미지 업로드

router.post("/photos", authMiddleware, upload.array("photos"), async (req, res) => {
  try {
    const imageReq = req.files;
    let imageArray = [];

    function LocationPusher() {
      for (let i = 0; i < imageReq.length; i++) {
        imageArray.push(imageReq[i].location);
      }
      return imageArray;
    }
    const photos = LocationPusher();
    res.status(200).json({ message: "사진을 업로드 했습니다.", photos });
  } catch (err) {
    res.status(400).send({ errorMessage: "사진업로드 실패-파일 형식과 크기(1.5Mb 이하) 를 확인해주세요." });
  }
});

// 프로젝트 등록

router.post("/", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  } else {
    const { userId } = res.locals.user;

    try {
      var { title, details, subscript, role, start, end, skills, email, phone, schedule, photos } = await projectPostSchema.validateAsync(req.body);
    } catch (err) {
      return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
    }

    if (!title || !details || !subscript || !role || !start || !end || !skills || !email || !phone || !schedule) {
      res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });
    } else {
      const skillsStr = JSON.stringify(skills);
      const photosStr = JSON.stringify(photos);
      const scheduleStr = JSON.stringify(schedule);

      const sql = `INSERT INTO projects
      (title, details, subscript, role, start, end, email, phone, userId, createdAt, schedule, skills, photos) 
      VALUES ('${title}', '${details}', '${subscript}', '${role}', '${start}',
      '${end}', '${email}', '${phone}', '${userId}',
      '${createdAt}', '${scheduleStr}', '${skillsStr}', '${photosStr}')`;

      await db.query(sql, (error, rows) => {
        if (error) throw error;
      });

      res.status(200).json({ message: "프로젝트 게시글을 작성했습니다." });
    }
  }
});

// 프로젝트 조회

router.get("/", async (req, res) => {
  await db.query("SELECT * FROM projects", (error, result, fields) => {
    if (error) {
      throw error;
    } else {
      let projects = [];

      for (let i = 0; i < result.length; i++) {
        let projectsRaw = result[i];
        let { projectId, userId, title, details, role, email, phone, start, end, subscript, createdAt } = projectsRaw;

        let skills = JSON.parse(projectsRaw.skills);
        let photos = JSON.parse(projectsRaw.photos);
        let schedule = JSON.parse(projectsRaw.schedule);

        let project = { projectId, userId, title, details, role, email, phone, start, end, subscript, createdAt, skills, photos, schedule };

        projects.push(project);
      }

      res.send({ projects });
    }
  });
});

// 프로젝트 상세 조회

router.get("/:projectId", async (req, res) => {
  const { projectId } = req.params;

  const sql = `SELECT * FROM projects WHERE projectId = ${projectId}`;
  await db.query(sql, (error, result, fields) => {
    if (error) {
      throw error;
    } else {
      const [projectRaw] = result;
      const { projectId, userId, title, details, role, email, phone, start, end, subscript, createdAt } = projectRaw;

      const skills = JSON.parse(projectRaw.skills);
      const photos = JSON.parse(projectRaw.photos);
      const schedule = JSON.parse(projectRaw.schedule);

      const project = { projectId, userId, title, details, role, email, phone, start, end, subscript, createdAt, skills, photos, schedule };

      res.send({ project: project });
    }
  });
});

// 프로젝트 수정

router.put("/:projectId", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  } else {
    const { userId } = res.locals.user;
    const { projectId } = req.params;

    try {
      var { title, details, subscript, role, start, end, skills, email, phone, schedule, photos } = await projectPostSchema.validateAsync(req.body);
    } catch (err) {
      return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
    }

    if (!title || !details || !subscript || !role || !start || !end || !skills || !email || !phone) {
      res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });
    } else {
      const selectQ = `SELECT * FROM projects WHERE userId = '${userId}'`;

      await db.query(selectQ, (error, result, fields) => {
        if (error) throw error;
        const [existProject] = result;

        if (userId === existProject.userId) {
          if (existProject) {
            const skillsStr = JSON.stringify(skills);
            const photosStr = JSON.stringify(photos);
            const scheduleStr = JSON.stringify(schedule);

            const putQ = `UPDATE projects SET title = '${title}', details = '${details}', 
              subscript = '${subscript}', role = '${role}', start = '${start}', 
              end = '${end}', skills = '${skillsStr}', email = '${email}', 
              phone = '${phone}', photos = '${photosStr}', schedule = '${scheduleStr}'
              WHERE projectId = ${projectId} AND userId = '${userId}'`;

            db.query(putQ, (error, result, fields) => {
              if (error) {
                throw error;
              } else {
                res.status(200).json({
                  message: "프로젝트 게시글을 수정했습니다.",
                });
              }
            });
          } else {
            res.status(400).send({ errorMessage: "작성자만 삭제할 수 있습니다." });
          }
        } else {
          res.status(401).send({ errorMessage: "로그인 후 사용하세요." });
        }
      });
    }
  }
});

// 프로젝트 삭제

router.delete("/:projectId", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  } else {
    const { projectId } = req.params;
    const { userId } = res.locals.user;
    const selectQ = `SELECT * FROM projects WHERE userId = '${userId}'`;

    await db.query(selectQ, (error, result, fields) => {
      if (error) throw error;
      const [existProject] = result;

      if (userId === existProject.userId) {
        if (existProject) {
          const deleteQ = `DELETE FROM projects WHERE projectId = ${projectId}`;

          db.query(deleteQ, (error, result, fields) => {
            if (error) throw error;
            res.status(200).json({
              message: "프로젝트 게시글을 삭제했습니다.",
            });
          });
        } else {
          res.status(400).send({ errorMessage: "작성자만 삭제할 수 있습니다." });
        }
      } else {
        res.status(401).send({ errorMessage: "로그인 후 사용하세요." });
      }
    });
  }
});

module.exports = router;
