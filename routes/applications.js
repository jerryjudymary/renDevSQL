const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { Project, ProjectSkill, ProjectPhoto, Application, Resume, sequelize } = require("../models");
// 유효성 검사 관련 import 추가 예정

// 면접 가능 일시를 선택하고 제출하면(한 번만 가능), 애플리케이션 테이블 해당 프로젝트 projectId에
// 지원자 id, 지원자가 선택한 resumeId, status, interviewCode를 해당 프로젝트의 날짜시간값을 가지는 schedule 컬럼이
// 있는 row에 put으로 업데이트!

// 추후 지원자측의 스케쥴 수정은 patch로 반영할 수 있을듯!

router.put("/:projectId/:applicationId", authMiddleware, async (req, res) => {
    if (!res.locals.user) {
      res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
    } else {
      const { id } = res.locals.user;
      const { projectId, applicationId } = req.params;
      console.log(projectId)

    // 유효성 검사 추후 추가
    //   try {
    //     var { title, details, subscript, role, start, end, skills, email, phone, schedule, photos }
    //     = await projectPostSchema.validateAsync(req.body);
    //   } catch (err) {
    //     return res.status(400).json({ errorMessage: "작성 형식을 확인해주세요." });
    //   }

      const { resumeId } = req.body;
      const status = 'reserved' // => '지원서 접수' 단계에 해당
      const interviewCode = 123456 // 6자리 유니크 난수

      const existProject = await Project.findOne({
        where: { projectId } 
      });

      const existApplications = await Application.findOne({
        where: { projectId, applicationId }
      });

      try { if (existApplications.status === null) {};
      } catch(error) {
        res.status(400).send({ errorMessage : '이미 예약된 시간대입니다.' });
      }

      try { if (existApplications.available === true) {};
      } catch(error) {
        res.status(400).send({ errorMessage : '예약할 수 없는 시간대입니다.' });
      }

      try { if (id !== existProject.id) {};
      } catch(error) {
        res.status(403).send({ errorMessage : '자신의 프로젝트에는 지원할 수 없습니다.' });
      }  

      Application.update({ id, resumeId, status, interviewCode },
      { where: { projectId, applicationId } });

    };
  });

module.exports = router;