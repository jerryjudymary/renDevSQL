const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { Project, ProjectSkill, ProjectPhoto, Application, Resume, sequelize } = require("../models");
// 필요시 유효성 검사 관련 import 추가 예정

// 면접 가능 일시를 선택하고 제출하면(한 번만 가능), 애플리케이션 테이블 해당 프로젝트 projectId에
// 지원자 id, 지원자가 선택한 resumeId, status, interviewCode를 해당 프로젝트의 날짜시간값을 가지는 schedule 컬럼이
// 있는 row에 put으로 업데이트!

// 추후 지원자측의 스케쥴 수정은 patch로 반영할 수 있을듯!

// 면접 예약

router.put("/:projectId/:applicationId", authMiddleware, async (req, res) => {
    if (!res.locals.user) {
      res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
    } else {
      const { id } = res.locals.user;
      const { projectId, applicationId } = req.params;
      const { resumeId } = req.body;
      const status = 'reserved' // => '지원서 접수' 단계에 해당
      const interviewCode = Math.floor(100000 + Math.random() * 900000); // 6자리 난수
      // 이 부분을 DB단에서 생성하거나 중복 방지 처리하는 것에 대해서 많이 시간을 쏟았는데,
      // UPDATE에선 메서드가 제한적이라, 0.000001 % 이하의 확률은 일단 나중에 고려하는 걸로 하겠습니다.

      const existProject = await Project.findOne({
        where: { projectId } 
      });
      const alreadyApplied = await Application.findOne({
        where: { projectId, id }
      });
      const existApplications = await Application.findOne({
        where: { projectId, applicationId }
      });

      if (alreadyApplied) {
        res.status(400).send({ errorMessage : '이미 해당 프로젝트에 지원하셨습니다.' });
      } else {
        if (existApplications.status !== null) {
          res.status(400).send({ errorMessage : '이미 예약된 시간대입니다.' });
        } else {
          if (existApplications.available !== true) {
            return res.status(400).send({ errorMessage : '예약할 수 없는 시간대입니다.' });
          } else {
            if (id === existProject.id) {
              return res.status(403).send({ errorMessage : '자신의 프로젝트에는 지원할 수 없습니다.' });
            } else {
              await Application.update({ id, resumeId, status, interviewCode, available: false },
              { where: { projectId, applicationId } });
              res.status(200).send({ message : '성공적으로 예약되었습니다.' })
            };
          };
        };
      };
    };
  });


  // 상세페이지 면접관련 정보 조회
module.exports = router;