const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { Project, projectPostSchema } = require("../models/project");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const mysql = require("mysql");

const dbConfig = require("../config/database.js");
const connection = mysql.createConnection(dbConfig);

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
    }

    const sql = `INSERT INTO projects
    (title, details, subscript, role, start, end, skills, email, phone, userId, createdAt, photos, schedule) 
    VALUES ('${title}', '${details}', '${subscript}', '${role}', '${start}',
    '${end}', '${skills}', '${email}', '${phone}', '${userId}',
    '${createdAt}', '${photos}', '${schedule}')`;

    connection.query(sql, (error, rows) => {
      if (error) throw error;
      console.log("rows:", rows);
    });
    res.status(200).json({ message: "프로젝트 게시글을 작성했습니다." });
  }
});

// 프로젝트 조회

router.get("/", async (req, res) => {
  await connection.query("SELECT * FROM projects", (error, result, fields) => {
    if (error) throw error;
    const projects = result;
    res.send({ projects });
  });
});

// 프로젝트 상세 조회

router.get("/:projectId", async (req, res) => {
  const { projectId } = req.params;

  const sql = `SELECT * FROM projects WHERE projectId = ${projectId}`;
  await connection.query(sql, (error, result, fields) => {
    if (error) throw error;
    const project = result;
    res.send({ project });
  });
});

// 프로젝트 수정

router.put("/:projectId", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  } else {
    const { userId } = res.locals.user;
    const { projectId } = req.params;
    const existProject = await Project.findOne({ projectId: projectId });

    try {
      var { title, details, subscript, role, start, end, skills, email, phone, schedule, photos } = await projectPostSchema.validateAsync(req.body);
    } catch (err) {
      return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
    }

    if (!title || !details || !subscript || !role || !start || !end || !skills || !email || !phone) {
      res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });
    }

    const selectQ = `SELECT * FROM projects WHERE userId = '${userId}'`;

    await connection.query(selectQ, (error, result, fields) => {
      if (error) throw error;
      const [existProject] = result;

      if (userId === existProject.userId) {
        if (existProject) {
          const putQ = `UPDATE projects SET title = '${title}', details = '${details}', 
              subscript = '${subscript}', role = '${role}', start = '${start}', 
              end = '${end}', skills = '${skills}', email = '${email}', 
              phone = '${phone}', photos = '${photos}', schedule = '${schedule}'
              WHERE projectId = ${projectId} AND userId = '${userId}'`;

          connection.query(putQ, (error, result, fields) => {
            if (error) throw error;
            res.status(200).json({
              message: "프로젝트 게시글을 수정했습니다.",
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

// 프로젝트 삭제

router.delete("/:projectId", authMiddleware, async (req, res) => {
  if (!authMiddleware) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  }

  const { projectId } = req.params;
  const { userId } = res.locals.user;
  const selectQ = `SELECT * FROM projects WHERE userId = '${userId}'`;

  await connection.query(selectQ, (error, result, fields) => {
    if (error) throw error;
    const [existProject] = result;

    if (userId === existProject.userId) {
      if (existProject) {
        const deleteQ = `DELETE FROM projects WHERE projectId = ${projectId}`;

        connection.query(deleteQ, (error, result, fields) => {
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
});

module.exports = router;
