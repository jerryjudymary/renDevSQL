const express = require("express");
const router = express.Router();
const { Project, ProjectSkill, Resume, ResumeSkill, sequelize } = require("../models");

// Project검색API, Resume검색API 둘 다 공용으로 사용할 함수 periodFilter와 skillFilter를 먼저 선언한다.
function periodFilter(inputItems, start, end) {
  let periodFilteredItems = [];
  inputItems.forEach((item) => {
    if (item.start <= start && item.end >= end) periodFilteredItems.push(item);
  });
  return periodFilteredItems;
}

// 요구스킬 필터링 함수 (Project, Resume 공용)
function skillFilter(inputItems, requiredSkills) {
  let skillFilteredItems = [];
  let allSkill;
  inputItems.forEach((item) => {
    allSkill = requiredSkills.every((specificSkill) => item["skills"].includes(specificSkill));
    if (allSkill) skillFilteredItems.push(item);
  });
  return skillFilteredItems;
}

// "Resume의 조건에 맞는 Projects" 매칭 API
router.get("/projects/:resumeId", async (req, res) => {
  const { resumeId } = req.params;

  // 선택한 resume의 role, start, end, skill 조건을 추출한다.
  const resumeStandard = await Resume.findOne({
    where: { resumeId: resumeId },
    include: [{ model: ResumeSkill, attributtes: ["skill"] }],
  });  

  const role = resumeStandard.role;
  const start = resumeStandard.start;
  const end = resumeStandard.end;
  const skill = resumeStandard.ResumeSkills.map((skill) => skill["skill"]);

  // Project DB에서 role로 필터링해 가져오면서, 앞으로 필터링할 객체 배열에는 필요한 요소들만 넣어 놓기
  const roleFilter = await Project.findAll({
    where: { role: role },
    include: [{ model: ProjectSkill, attributtes: ["skill"] }],
  });

  // Project의 정보 중 필요한 요소들만 빼내기 위한 부분,
  // 특히 skills 배열의 데이터 형태를 보기 좋게 가공한다.
  let roleFilteredProjects = [];
  const projectSkills = roleFilter.map((project) => project.ProjectSkills.map((skill) => skill["skill"]));

  roleFilter.forEach((project, index) => {
    let projectObject = {};

    projectObject.projectId = project.projectId;
    projectObject.nickname = project.nickname;
    projectObject.title = project.title;
    projectObject.subscript = project.subscript;
    projectObject.role = project.role;
    projectObject.start = project.start;
    projectObject.end = project.end;
    projectObject.skills = projectSkills[index];
    projectObject.createdAt = project.createdAt;

    roleFilteredProjects.push(projectObject);
  });

  // 기간 필터링 함수 실행
  const periodFilteredProjects = await periodFilter(roleFilteredProjects, start, end);

  // 요구스킬 필터링 (공용 함수와 다르다는 것에 주의!)
  //  특정 resume의 조건에 맞는 project란, resume의 skill을 모두 포함하고 있는 project가 아니다.
  //  반대로 resume가 특정 project의 skill을 모두 포함하고 있어야 요구 조건에 맞다.
  let skillFilteredProjects = [];
  let allSkill;

  periodFilteredProjects.forEach((project) => {
    allSkill = project["skills"].every((specificSkill) => skill.includes(specificSkill));
    if (allSkill) skillFilteredProjects.push(project);
  });

  return res.json(skillFilteredProjects);
});

// "Project의 조건에 맞는 Resumes" 매칭 API
router.get("/resumes/:projectId", async (req, res) => {
  const { projectId } = req.params;

  // 선택한 resume의 role, start, end, skill 조건을 추출한다.
  const projectStandard = await Project.findOne({
    where: { projectId: projectId },
    include: [{ model: ProjectSkill, attributtes: ["skill"] }],
  });

  const role = projectStandard.role;
  const start = projectStandard.start;
  const end = projectStandard.end;
  const skill = projectStandard.ProjectSkills.map((skill) => skill["skill"]);

  // DB에서 role로 필터링해 가져오면서, 앞으로 필터링할 객체 배열에는 필요한 요소들만 넣어 놓기
  const roleFilter = await Resume.findAll({
    where: { role: role },
    include: [{ model: ResumeSkill, attributtes: ["skill"] }],
  });

  // Resume의 정보 중 필요한 요소들만 빼내기 위한 부분,
  // 특히 skills 배열의 데이터 형태를 보기 좋게 가공한다.
  let roleFilteredResumes = [];
  const resumeSkills = roleFilter.map((resume) => resume.ResumeSkills.map((skill) => skill["skill"]));

  roleFilter.forEach((resume, index) => {
    let resumeObject = {};

    resumeObject.resumeId = resume.resumeId;
    resumeObject.nickname = resume.nickname;
    resumeObject.resumeImage = resume.resumeImage;
    resumeObject.content = resume.content;
    resumeObject.role = resume.role;
    resumeObject.start = resume.start;
    resumeObject.end = resume.end;
    resumeObject.skills = resumeSkills[index];
    resumeObject.createdAt = resume.createdAt;

    roleFilteredResumes.push(resumeObject);
  });  

  // 기간 필터링 (주의! 공용 기간 필터링 함수와 다르다) 
  // 프로젝트의 기간보다 Resume의 기간이 커야함.
  // 즉 Resume의 기간 안에 Project의 기간이 들어와야 한다. 
  let periodFilteredResumes = [];

  roleFilteredResumes.forEach((item) => {
    if (item.start <= start && item.end >= end) 
    periodFilteredResumes.push(item);
  });  

  // 요구스킬 필터링 함수 실행
  const skillFilteredResumes = await skillFilter(periodFilteredResumes, skill);  

  return res.json(skillFilteredResumes);
});

module.exports = router;
