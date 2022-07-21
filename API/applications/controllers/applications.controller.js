const { Project, Application, Resume, ResumeSkill, sequelize } = require("../../../models");
const { QueryTypes, Op } = require("sequelize");
const { noteProjectOwner, noteApplicant } = require("./notices.controller");


// 필요시 유효성 검사 관련 import 추가 예정

// 추후 지원자측의 스케쥴 수정은 patch로 반영할 수 있을 듯

// 지원자가 면접 취소 원할시, 지원자가 프로젝트 팀장한테 통보하면 팀장은 그 스케쥴을 다시 원상태로 되돌리기?

// 면접 예약

exports.reserveApp = async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  const { id } = res.locals.user;
  const { applicationId } = req.params;
  const { resumeId } = req.body;
  const existApplication = await Application.findOne({
    where: { applicationId }
  });

  if(!existApplication) {
    return res.status(404).json({ errorMessage: "프로젝트 예약 정보가 존재하지 않습니다." });
  };

  const status = 'reserved'; // => 와이어프레임상 '모집완료' 단계에 해당

  const projectId = existApplication.projectId;

  const existProject = await Project.findOne({
    where: { projectId } 
  });

  const alreadyApplied = await Application.findOne({
    where: { projectId, id }
  });

  if (alreadyApplied) {
    return res.status(400).send({ errorMessage : '이미 해당 프로젝트에 지원하셨습니다.' });
  };

  if (id === existProject.id) {
    return res.status(403).send({ errorMessage : '자신의 프로젝트에는 지원할 수 없습니다.' });
  };

  if (existApplication.status !== null) {
    return res.status(400).send({ errorMessage : '이미 예약된 시간대입니다.' });
  };

  if (existApplication.available !== true) {
    return res.status(400).send({ errorMessage : '예약할 수 없는 시간대입니다.' });
  };

  const query = `UPDATE application SET interviewCode=LEFT(UUID(), 6) WHERE applicationId='${applicationId}'`; 
  await sequelize.query(query, { type: QueryTypes.UPDATE }); // 6자리 UUID 생성

  await Application.update({ id, resumeId, status, available: false },
  { where: { projectId, applicationId } })
   
  await noteProjectOwner( projectId, resumeId, applicationId ); // 이메일 발송
  await noteApplicant( projectId, resumeId, applicationId );
   

  res.status(200).send({ message : '성공적으로 예약되었습니다.' });

};


// 지원자의 지원서 목록 조회

exports.appInfo = async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 상태가 아닙니다." });
  };

  const { id } = res.locals.user;

  const resumesQuery = await Resume.findAll({
    where: { id },
    include: [
      {
        model: ResumeSkill,
        attributes: ["skill"]
      }
    ]
  });

  if (!resumesQuery || !resumesQuery.length) { 
    return res.status(404).json({ errorMessage: "지원서가 존재하지 않습니다." });
  };

  const resumeSkills = resumesQuery.map((resume) => resume.ResumeSkills.map((skill) => skill["skill"]));
  let resumes = [];

  resumesQuery.forEach((resume, index) => {
    let resumeObject = {};
    resumeObject.resumeId = resume.resumeId;
    resumeObject.nickname = resume.nickname;
    resumeObject.resumeImage = resume.resumeImage;
    resumeObject.content = resume.content;
    resumeObject.start = resume.start;
    resumeObject.end = resume.end;
    resumeObject.role = resume.role;
    resumeObject.skills = resumeSkills[index];
    resumeObject.createdAt = resume.createdAt;

    resumes.push(resumeObject);
  });
  res.send({ resumes });
};


// 프로젝트 팀장의 해당 인터뷰 완료 상태 업데이트

exports.appInterviewed = async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  const { id } = res.locals.user;
  const { applicationId } = req.params;

  const existApplication = await Application.findOne({
    where: { applicationId }
  });

  if (!existApplication) {
    return res.status(404).json({ errorMessage: "예약 정보가 존재하지 않습니다." });
  };

  const existProject = await Project.findOne({
    where: { projectId: existApplication.projectId } 
  });

  if (existProject.id !== id) {
    return res.status(403).send({ errorMessage : '회원님의 프로젝트가 아닙니다.' });
  };

  if (existApplication.status !== "reserved" || existApplication.available !== false) {
    return res.status(400).send({ errorMessage : '예약 상태의 인터뷰가 아닙니다.' });
  };


  const status = 'interviewed' // => 와이어프레임상 '면접완료' 단계에 해당

  await Application.update({ status },
  { where: { applicationId } })


  res.status(200).send({ message : '면접 완료 처리되었습니다.' });

};


// 프로젝트 팀장의 프로젝트 매칭 결과 상태 업데이트

exports.appMatched = async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  const { id } = res.locals.user;
  const { applicationId } = req.params;
  const { status } = req.body; // status 값으로 matched나 unmatched를 받습니다

  const existApplication = await Application.findOne({
    where: { applicationId }
  })

  if (!existApplication) {
    return res.status(404).json({ errorMessage: "프로젝트 예약 정보가 존재하지 않습니다." });
  };


  const projectId = existApplication.projectId

  const existProject = await Project.findOne({
    where: { projectId } 
  });


  if (existProject.id !== id) {
    return res.status(403).send({ errorMessage : '회원님의 프로젝트가 아닙니다.' });
  };

  if (existApplication.status === "matched" || existApplication.status === "unmatched" || existApplication.status === "closed") {
    return res.status(400).send({ errorMessage : '이미 마감된 지원사항입니다.' });
  };

  if (existApplication.available !== false) {
    return res.status(400).send({ errorMessage : '예약된 시간대가 아닙니다.' });
  };


  if (status === "matched") { // matched 처리시 다른 시간대 전부 unmatched 처리

  await Application.update({ status },
  { where: { projectId, applicationId }, returning: true})
    .then(
      await Application.update({ status: 'unmatched', available: false },
      { where: { projectId, applicationId: { [Op.ne]: applicationId } } })
    );

  } else if (status === "unmatched") {

    await Application.update({ status: "unmatched" },
    { where: { projectId, applicationId } })

  } else {
    return res.status(400).json({ errorMessage: "매칭 결과 처리에 실패했습니다." });
  };

  res.status(200).send({ message : '매칭 결과가 처리되었습니다.' });

};


// 프로젝트 팀장의 프로젝트 마감 상태 업데이트

exports.appDone = async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  const { id } = res.locals.user;
  const { projectId } = req.params;

  const existApplications = await Application.findAll({
    where: { projectId }
  });

  if (!existApplications.length) {
    return res.status(404).json({ errorMessage: "프로젝트 예약 정보가 존재하지 않습니다." });
  };

  const existProject = await Project.findOne({
    where: { projectId, id } 
  });

  if (!existProject) {
    return res.status(403).send({ errorMessage : '회원님의 프로젝트가 아닙니다.' });
  };

  const statusArray = existApplications.map((app) => app.status);
  if (statusArray.includes("closed") || statusArray.includes("matched")) {
    return res.status(404).json({ errorMessage: "이미 마감된 프로젝트입니다." });
  }

/** 
 * matched나 closed가 하나라도 존재하는 프로젝트는 마감인 것으로 간주
 */ 

  await Application.update({ status: 'closed', available: false },
  { where: { projectId } });

  res.status(200).send({ message : '프로젝트 마감 처리되었습니다.' });

};