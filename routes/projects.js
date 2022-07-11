const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { Project, ProjectSkill, ProjectPhoto, Application, sequelize } = require("../models");
const { projectPostSchema } = require("../controller/projectValidation.controller.js");
const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const s3 = new aws.S3();
const moment = require("moment");
const { v4 } = require("uuid");

// multer - S3 이미지 업로드 설정

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "jerryjudymary",
    acl: "public-read",
    key: function (req, file, cb) {  // 이미지 파일 이름 설정
      cb(null, "projectImage/" + v4().toString().replace("-", "") + "." + file.originalname.split(".").pop());
    },
  }),
});

// 이미지 업로드

router.post('/photos', authMiddleware, upload.array('photos'), async (req, res) => {
  try {
    const photos = req.files.map(image => image.location);
    res.status(200).json({ message : '사진을 업로드 했습니다.', photos });
  } catch (err) {
    return res.status(400).send({ errorMessage : '사진업로드 실패-파일 형식과 크기(1.5Mb 이하) 를 확인해주세요.' });
  };
});

// 프로젝트 등록

router.post("/", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  const { id, nickname, userId } = res.locals.user;

  if (!id || !nickname || !userId ) {
    return res.status(404).json({ errorMessage: "회원정보가 올바르지 않습니다." });
  }

  try {
    var { title, details, subscript, role, start, end, skills, schedule, photos }
    = await projectPostSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
  };

  if (!title || !details || !subscript || !role || !start
  || !end || !skills || !schedule) {
    return res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });
  };

  if (start >= end) return res.status(400).json({ errorMessage: "날짜 형식이 잘못되었습니다." });
  
  const available = true;
  const createdAt = moment().format("YYYY-MM-DD hh:mm:ss");
  const email = userId;

  // 시퀄라이즈 쿼리의 반환값은 promise로 반환되므로 .then을 붙여 이용해 줍니다

  try {
    await Project.create({ title, details, subscript, role, start, end, email, id, nickname, createdAt })
    .then(result => {

      schedule.forEach(
        (time) => Application.create({ projectId: result.projectId, schedule : time, available})
      );

      skills.forEach(
        (skill) => ProjectSkill.create({ projectId: result.projectId, skill })
      );

      if (photos || photos.length) {
        photos.forEach(
          (photo) => ProjectPhoto.create({ projectId: result.projectId, photo })
        );
      };
    });
      res.status(200).json({ message : '프로젝트 게시글을 작성했습니다.' });
  } catch (error) {
    return res.status(400).json({ errorMessage: "게시글 등록 실패" });
  }
});

// 프로젝트 조회

router.get("/", async (req, res) => {
  const projectsQuery = await Project.findAll({
    include: {
      model: ProjectSkill,
      attributes:['skill'],
      required: true // 자식 테이블로 ProjectSkill row가 존재하는 projects만 불러옵니다
    }
  });

  const projectSkills = projectsQuery.map(project => project.ProjectSkills.map( skill => skill["skill"] ));

  let projects = [];

  projectsQuery.forEach((project, index) => {
    let createdAt = moment(project.createdAt).format("YYYY-MM-DD hh:mm:ss");
    let projectArray = {};

    projectArray.projectid = project.projectId;
    projectArray.nickname = project.nickname;
    projectArray.title = project.title;
    projectArray.subscript = project.subscript;
    projectArray.role = project.role;
    projectArray.start = project.start;
    projectArray.end = project.end;
    projectArray.createdAt = createdAt; 
    projectArray.skills = projectSkills[index];

    projects.push(projectArray);
    }
  );
      
  res.send({ projects });
});

// 프로젝트 상세 조회

router.get("/:projectId", async (req, res) => {
  const { projectId } = req.params;
  const projectQuery = await Project.findOne({

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
        attributes:['applicationId', 'schedule','available','status','interviewCode'],
      }
    ]
  });

  if (!projectQuery) { 
    return res.status(404).json({ errorMessage: "프로젝트 정보가 존재하지 않습니다." });
  };

  const skills = projectQuery.ProjectSkills.map(eachSkill => eachSkill.skill);
  const photos = projectQuery.ProjectPhotos.map(eachPhoto => eachPhoto.photo);
  const createdAt = moment(projectQuery.createdAt).format("YYYY-MM-DD hh:mm:ss");

  let applications = [];

  projectQuery.Applications.forEach((eachApp, index) => {
    let schedule = moment(eachApp.schedule).format("YYYY-MM-DD hh:mm:ss");
    let application = {};

    application.applicationId = eachApp.applicationId;
    application.schedule = schedule;
    application.available = eachApp.available;
    application.status = eachApp.status;
    application.interviewCode = eachApp.interviewCode;

    applications.push(application);
    }
  )

  const project = {
    projectId: projectQuery.projectId,
    id: projectQuery.id,
    title: projectQuery.title,
    details: projectQuery.details,
    role: projectQuery.role,
    email: projectQuery.email,
    start: projectQuery.start,
    end: projectQuery.end,
    subscript: projectQuery.end,
    nickname: projectQuery.nickname,
    createdAt,
    applications,
    photos,
    skills
  };

    res.send({ project });
});

// 프로젝트 수정

router.put("/:projectId", authMiddleware, async (req, res) => {
  const { id, nickname } = res.locals.user;
  const { projectId } = req.params;

  const existProject = await Project.findOne({
    where: { projectId, id }
  });

  if (!existProject) {
    return res.status(404).json({ errorMessage: "프로젝트 정보가 존재하지 않습니다." });
  };
    
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  if (id !== existProject.id) {
    return res.status(400).send({ errorMessage : '작성자만 수정할 수 있습니다.' });
  };

  try {
    var { title, details, subscript, role, start, end, skills, photos }
    = await projectPostSchema.validateAsync(req.body);
  } catch (err) {
    return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
  };

  if ( !title || !details || !subscript || !role || !start || !end || !skills ) {
    return res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });
  };

  if (start >= end) return res.status(400).json({ errorMessage: "날짜 형식이 잘못되었습니다." });

  // --- 기존 이미지 선별적 다중 삭제

  const existPhotos = await ProjectPhoto.findAll({
    where: { projectId }
  })

  if (existPhotos.length) {
    let deletePhotos = [];
    let photoUrl;
    let photo;
    existPhotos.forEach((item) => {
      photoUrl = item.dataValues.photo; // DB에 저장되어있는 URL에서 키값만 추출
      if ( photos.includes(photoUrl) === false ) { // photoUrl(기존 DB에 있는 각 이미지 URL이 body로 온 photos에 없다면 해당 URL 삭제)
        photo = photoUrl.split('.com/')[1];
        deletePhotos.push({ Key: photo }); // [{키: 밸류},{키: 밸류}] 형태로 전달해 줍니다
      };
    });

    if (deletePhotos.length) {
      const params = {
        Bucket: 'jerryjudymary', 
        Delete: {
          Objects: deletePhotos, 
          Quiet: false
        }
      };
    
      s3.deleteObjects(params, function(err, data) {
        if (err) { console.log('에러:', err) 
        return(err) }
        else console.log("버킷의 이미지들이 삭제 - 수정되었습니다.");
      });
    } 
  };

  // ---
 
  // 예외처리 문제로 트랜잭션 밖으로 빼 줍니다.
  if (photos || photos.length) {
    await ProjectPhoto.destroy({ where: { projectId }});
    for (let i = 0; i < photos.length; i++) {
      await ProjectPhoto.create({ projectId, photo : photos[i] });
    };
  }

  const t = await sequelize.transaction(); // 이하 쿼리들 트랜잭션 처리

  try {
    await Project.update({ title, details, subscript, role, start, end, nickname },
    { where: { projectId }, transaction: t });

    /* 현재 스케쥴부분 MVP까지 수정 제외로 주석처리합니다 

    // 등록 당시의 개수와 수정 당시의 개수가 다르면 update 사용 곤란으로 삭제 후 재등록 처리
    //현재 스케쥴을 등록하면 이전 스케쥴은 무조건 사라지는 문제 해결해야 함( 프론트에서 해결 가능..? )
    await Application.destroy({ where: { projectId }, transaction: t }); // delete로 지워주고 새로 등록
    for (let i = 0; i < schedule.length; i++) {
      await Application.create({ projectId, schedule : schedule[i] }, { transaction: t });
    }; // 추후 available등 수정 시 사항 추가 가능하게? -> 면접시간 수정용 API가 하나 더 있어야할 것 같다.
    */

    // 스케쥴과 동일한 문제 있음
    await ProjectSkill.destroy({ where: { projectId }, transaction: t });
    for (let i = 0; i < skills.length; i++) {
      await ProjectSkill.create({ projectId, skill : skills[i] },  { transaction: t });
    };

    await t.commit();

    return res.status(200).json({
      message: "프로젝트 게시글을 수정했습니다.",
    });

  } catch(error) {
    await t.rollback();
    return (error);
  };
});

// 프로젝트 삭제

router.delete("/:projectId", authMiddleware, async (req, res) => {
  const { id } = res.locals.user;
  const { projectId  } = req.params;

  const existProject = await Project.findOne({
    where: { projectId, id }
  })

  if (!existProject) {
    return res.status(404).json({ errorMessage: "프로젝트 정보가 존재하지 않습니다." });
  };

  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  if (id !== existProject.id) {
    return res.status(401).send({ errorMessage : '작성자만 삭제할 수 있습니다.' });
  };
  
 // --- 기존 이미지 다중 삭제

  const existPhotos = await ProjectPhoto.findAll({
    where: { projectId }
  })

  if (existPhotos.length) {
    let deletePhotos = [];
    existPhotos.forEach((item) => {
      let photoUrl = item.dataValues.photo; // DB에 저장되어있는 URL에서 키값만 추출
      const photo = photoUrl.split('.com/')[1];
      deletePhotos.push({ Key: photo }); // [{키: 밸류},{키: 밸류}] 형태로 전달해 줍니다
    });
   
    const params = {
      Bucket: 'jerryjudymary', 
      Delete: {
        Objects: deletePhotos, 
        Quiet: false
      }
    };

    s3.deleteObjects(params, function(err, data) {
      if (err) { console.log('에러:', err) 
      return(err) }
      else console.log("버킷의 이미지들이 삭제 - 수정되었습니다."); 
    });
  };

// ---

  Project.destroy({ // ON DELETE CASCADE 적용으로 자식 테이블의 데이터도 지워집니다
    where: { projectId, id },
  });

  res.status(200).json({
    message: "프로젝트 게시글을 삭제했습니다.",
  });
});

module.exports = router;