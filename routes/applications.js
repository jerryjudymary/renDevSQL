const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { Project, ProjectSkill, ProjectPhoto, Application, Resume, sequelize } = require("../models");
const { QueryTypes } = require("sequelize");
const { noteProjectOwner, noteApplicant } = require("./notices");

// 필요시 유효성 검사 관련 import 추가 예정

// 면접 가능 일시를 선택하고 제출하면(한 번만 가능), 애플리케이션 테이블 해당 프로젝트 projectId에
// 지원자 id, 지원자가 선택한 resumeId, status, interviewCode를 해당 프로젝트의 날짜시간값을 가지는 schedule 컬럼이
// 있는 row에 put으로 업데이트!
// 추후 지원자측의 스케쥴 수정은 patch로 반영할 수 있을듯!

// 지원자가 면접 취소 원할시, 지원자가 프로젝트 팀장한테 통보하면 팀장은 그 스케쥴을 다시 원상태로 되돌리기?

// 면접 예약

router.put("/:projectId/:applicationId", authMiddleware, async (req, res) => {

  const { id } = res.locals.user;
  const { projectId, applicationId } = req.params;
  const { resumeId } = req.body;
  const existApplications = await Application.findOne({
    where: { projectId, applicationId }
  });

  if(!existApplications) {
    return res.status(404).json({ errorMessage: "프로젝트 예약 정보가 존재하지 않습니다." });
  };

  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  const status = 'reserved' // => 와이어프레임상 '모집완료' 단계에 해당

  const existProject = await Project.findOne({
    where: { projectId } 
  });
  const alreadyApplied = await Application.findOne({
    where: { projectId, id }
  });

  if (alreadyApplied) {
    return res.status(400).send({ errorMessage : '이미 해당 프로젝트에 지원하셨습니다.' });
  };

  if (existApplications.status !== null) {
    return res.status(400).send({ errorMessage : '이미 예약된 시간대입니다.' });
  };

  if (existApplications.available !== true) {
    return res.status(400).send({ errorMessage : '예약할 수 없는 시간대입니다.' });
  };

  if (id === existProject.id) {
    return res.status(403).send({ errorMessage : '자신의 프로젝트에는 지원할 수 없습니다.' });
  };

  const query = `UPDATE application SET interviewCode=LEFT(UUID(), 6) WHERE applicationId='${applicationId}'`; 
  await sequelize.query(query, { type: QueryTypes.UPDATE }); // 6자리 UUID 생성

  await Application.update({ id, resumeId, status, available: false },
  { where: { projectId, applicationId } })
   
  await noteProjectOwner( projectId, resumeId, applicationId ); // 이메일 발송
  await noteApplicant( projectId, resumeId, applicationId );
   

  res.status(200).send({ message : '성공적으로 예약되었습니다.' });

});

// 지원자의 지원서 목록 조회

router.get("/resumes", authMiddleware, async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 상태가 아닙니다." });
  };

  const { id } = res.locals.user;

  const resumes = await Resume.findAll({
    where: { id }
  });

  if (!resumes || !resumes.length) { 
    res.status(404).json({ errorMessage: "지원서가 존재하지 않습니다." });
  } else {
    res.send({ resumes });
  };
});

 
module.exports = router;