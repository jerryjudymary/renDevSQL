const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { Project, ProjectSkill, ProjectPhoto, Application, Resume, sequelize } = require("../models");
const { projectPostSchema } = require("../controller/projectValidation.controller.js");
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
const createdAt = `${years<10?`0${years}`:`${years}`}` + '-' + `${months<10?`0${months}`:`${months}`}` + '-' + `${dates<10?`0${dates}`:`${dates}`}` + ' ' +
`${hours<10?`0${hours}`:`${hours}`}` + ':' + `${minutes<10?`0${minutes}`:`${minutes}`}` +
':' + `${seconds<10?`0${seconds}`:`${seconds}`}`;

// 이미지 업로드

router.post('/photos', authMiddleware, upload.array('photos'), async (req, res) => {
  try {
    const imageReq = req.files;
    let imageArray = [];
    
    function LocationPusher() {
      for (let i = 0; i < imageReq.length; i++) {
        imageArray.push(imageReq[i].location);
      } return imageArray;
    };
      const photos = LocationPusher();
      res.status(200).json({ message : '사진을 업로드 했습니다.', photos });

  } catch (err) {
    res.status(400).send({ errorMessage : '사진업로드 실패-파일 형식과 크기(1.5Mb 이하) 를 확인해주세요.' });
  };
});

// 프로젝트 등록

router.post("/", authMiddleware, async (req, res) => {
    if (!res.locals.user) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
    } else {
    const { id, nickname } = res.locals.user;
    try { // role, skills, schedule 1차엔 없음, email phone 삭제
      var { title, details, subscript, role, start, end, skills, email, phone, schedule, photos }
      = await projectPostSchema.validateAsync(req.body);
    } catch (err) {
      return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
    };

    if (!title || !details || !subscript || !role || !start
    || !end || !skills || !email || !phone || !schedule) {
      res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });
    } else {
    
    const available = true;
    // 시퀄라이즈 쿼리의 반환값은 promise로 반환되므로 .then을 붙여 이용해 줍니다
    await Project.create({ title, details, subscript, role, start, end, email, phone, id, nickname, createdAt })
    .then(result => {
      for (let i = 0; i < schedule.length; i++) {
        Application.create({ projectId: result.projectId, schedule : schedule[i], available});
      }

      for (let i = 0; i < skills.length; i++) {
        ProjectSkill.create({ projectId: result.projectId, skill : skills[i] });
      }

      if (photos) {
        for (let i = 0; i < photos.length; i++) {
          ProjectPhoto.create({ projectId: result.projectId, photo : photos[i] });
        }
      }
    });
      res.status(200).json({ message : '프로젝트 게시글을 작성했습니다.' });
    }
  }
});

// 프로젝트 조회

router.get("/", async (req, res) => {
  const projects = await Project.findAll({
    include: {
      model: ProjectSkill,
      attributes:['skill'],
      required: true // 자식 테이블로 ProjectSkill row가 존재하는 projects만 불러옵니다
    }
  });
  res.send( projects );
});

// 프로젝트 상세 조회

router.get("/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const project = await Project.findOne({

    where: {
      projectId
    },
    include: [
      {
        model: ProjectSkill,
        attributes:['skill'],
      },
      {
        model: ProjectPhoto,
        attributes:['photo'],
      },
      {
        model: Application,
        attributes:['applicationId', 'schedule','available','status','interviewcode'],
      }
    ]
  });

  res.send({ project });
});

// 프로젝트 수정

router.put("/:projectId", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  } else {
    const { id, nickname } = res.locals.user;
    const { projectId } = req.params;

    try {
      var { title, details, subscript, role, start, end, skills, email, phone, schedule, photos }
      = await projectPostSchema.validateAsync(req.body);
    } catch (err) {
      return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
    }

    if (!title || !details || !subscript || !role || !start || !end || !skills || !email || !phone) {
      res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });
    } else {
      const existProject = await Project.findOne({
        where: { projectId, id }
      })
      if (id === existProject.id) {
        const t = await sequelize.transaction(); //이하 쿼리들 트랜잭션 처리
        try {
          Project.update({ title, details, subscript, role, start, end, email, phone, nickname },
          { where: { projectId: projectId } });

          // 등록 당시의 개수와 수정 당시의 개수가 다르면 update 사용 곤란으로 삭제 후 재등록 처리
          if (schedule.length) { //현재 스케쥴을 등록하면 이전 스케쥴은 무조건 사라지는 문제 해결해야 함( 프론트에서 해결 가능..? )
            await Application.destroy({ where: { projectId }, transaction: t }); // delete로 지워주고 새로 등록
            for (let i = 0; i < schedule.length; i++) {
              await Application.create({ projectId, schedule : schedule[i], available: true}, { transaction: t });
            }
          } // 추후 available등 수정 시 사항 추가 가능하게?

          if (skills.length) { // 스케쥴과 동일한 문제 있음
            await ProjectSkill.destroy({ where: { projectId}, transaction: t });
            for (let i = 0; i < skills.length; i++) {
              await ProjectSkill.create({ projectId, skill : skills[i] },  { transaction: t });
            }
          }
    
          if (photos.length) { // 스케쥴과 동일한 문제 있음
            console.log(photos)
            await ProjectPhoto.destroy({ where: { projectId }, transaction: t });
            for (let i = 0; i < photos.length; i++) {
              await ProjectPhoto.create({ projectId, photo : photos[i] },  { transaction: t });
            }
          };
          res.status(200).json({
            message: "프로젝트 게시글을 수정했습니다.",
          });
          await t.commit();
        } catch(error) {
          await t.rollback();
        }
      } else {
        res.status(400).send({ errorMessage : '작성자만 수정할 수 있습니다.' });
      }
    }
  };
});

// 프로젝트 삭제

router.delete("/:projectId", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  } else {

  const { projectId } = req.params;;
  const { id } = res.locals.user;

  const existProject = await Project.findOne({
    where: { projectId, id }
  })

      if (id === existProject.id) {
        if (existProject) {
          Project.destroy({ // ON DELETE CASCADE 적용으로 자식 테이블의 데이터도 지워집니다
            where: { projectId, id },
          });
          res.status(200).json({
              message: "프로젝트 게시글을 삭제했습니다.",
            });
        } else {
          res.status(400).send({ errorMessage : '작성자만 삭제할 수 있습니다.' });
        };
      } else {
        res.status(401).send({ errorMessage : '로그인 후 사용하세요.' });
      } ;
   }
});

module.exports = router;