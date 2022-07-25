const express = require("express");
const logger = require("../../../config/logger");
const { QueryTypes } = require("sequelize");
const { Project, ProjectSkill, Resume, ResumeSkill, sequelize } = require("../../../models");

// Project검색API, Resume검색API 둘 다 공용으로 사용할 함수 periodFilter와 skillFilter를 먼저 선언한다.
function periodFilter(inputItems, start, end) {
  let periodFilteredItems = [];
  inputItems.forEach((item) => {
    if (item.start >= start && item.end <= end) periodFilteredItems.push(item);
  });
  return periodFilteredItems;
}
// 해설 : 기간 필터링 함수는 날짜를 비교하는 조건문이 있어, 로컬에서 잘 돌아가다가 서버에선 제대로 돌지 않을 수 있다. 확인 필요.
// 문제가 생긴다면 날짜를 다루는 변수들에 new Date()를 씌우는 등의 방법으로 data type을 관리해줘야 한다.

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

// 해설 : 배열 method "every"를 활용한다. every는 대상 배열의 모든 요소가 주어진 조건식을 만족하면 true, 아닐 경우 false를 반환한다.
// 즉, "요구되는 스킬로 입력받은 배열 requiredSkills의 모든 요소(specificSkill)들이 inputItems(=Project/Resume) 중 특정 item에 포함되어 있다"면,
// 해당 item에 대한 every 메소드는 true를 반환할 것이며, 요구스킬 조건을 만족한다는 의미이므로 skillFilteredItems에 포함시켜준다(push).

// 프로젝트 검색 API
exports.projectSearch = async (req, res) => {
  try {
    const { role, skill, start, end } = req.query;
    // DB에서 role로 필터링해 가져오면서, 앞으로 필터링할 객체 배열에는 필요한 요소들만 넣어 놓기
    const roleFilter = role
      ? await Project.findAll({
          where: { role: role },
          include: [{ model: ProjectSkill, attributtes: ["skill"] }],
          order: [["start", "ASC"]],
        })
      : await Project.findAll({
          include: [{ model: ProjectSkill, attributtes: ["skill"] }],
          order: [["createdAt", "DESC"]],
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
    console.log(roleFilteredProjects);

    if (start >= end) return res.status(400).send({ errorMessage: "날짜 검색이 잘못되었습니다" });

    // 기간 필터링 함수 실행
    const periodFilteredProjects = start && end ? await periodFilter(roleFilteredProjects, start, end) : roleFilteredProjects;

    // 요구스킬 필터링 함수 실행
    const skillFilteredProjects = skill ? await skillFilter(periodFilteredProjects, skill) : periodFilteredProjects;

    return res.json(skillFilteredProjects);
  } catch (error) {
    logger.error(error);
    res.status(400).send({ errorMessage: "검색 실패" });
  }
};

// Resume 찾기 API
exports.resumeSearch = async (req, res) => {
  try {
    const { role, skill, start, end } = req.query;
    // DB에서 role로 필터링해 가져오면서, 앞으로 필터링할 객체 배열에는 필요한 요소들만 넣어 놓기
    const roleFilter = role
      ? await Resume.findAll({
          where: { role: role },
          include: [{ model: ResumeSkill, attributtes: ["skill"] }],
          order: [["start", "ASC"]],
        })
      : await Resume.findAll({
          include: [{ model: ResumeSkill, attributtes: ["skill"] }],
          order: [["createdAt", "DESC"]],
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

    if (start >= end) return res.status(400).send({ errorMessage: "날짜 검색이 잘못되었습니다" });

    // 기간 필터링 함수 실행
    const periodFilteredResumes = start && end ? await periodFilter(roleFilteredResumes, start, end) : roleFilteredResumes;

    // 요구스킬 필터링 함수 실행
    const skillFilteredResumes = skill ? await skillFilter(periodFilteredResumes, skill) : periodFilteredResumes;

    return res.json(skillFilteredResumes);
  } catch {
    logger.error(error);
    res.status(400).send({ errorMessage: "검색 실패" });
  }
};
