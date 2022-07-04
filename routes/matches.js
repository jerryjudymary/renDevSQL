const express = require("express");
const router = express.Router();

// MySQL DB import, config, connection
const mysql = require("mysql");
const dbConfig = require("../config/database");
const connection = mysql.createConnection(dbConfig);
const { Sequelize } = require("sequelize");

// 매칭기능 1) 프로젝트에 맞는 이력서를 조회
router.get("/resumes/:projectId", async (req, res) => {
  //여기에, 현재 로그인 user가 project 작성 유저인지 확인하는 부분도 만들 것.
  const { projectId } = req.params;
  let project;
  let FitPeriodResumes;

  // 파라미터로 입력받은 projectId에 해당하는 project를 MySQL에서 가져옴.
  await connection.query(`SELECT * FROM projects WHERE projectId = ${projectId}`, (error, result, fields) => {
    if (error) throw error;
    project = result;
    console.log(project, result);
  });
  // console.log(project);

  // MySQL DB에서, 기준이 되는 project와 기간 조건(start, end)이 맞는 Resume만 가져옴.
  await connection.query(
    `SELECT * 
      FROM resumes
      WHERE 
        start <= ${project.start}
        AND
        end >= ${project.end}`,
    (error, result, fields) => {
      if (error) throw error;
      FitPeriodResumes = result;
    }
  );
  console.log(FitPeriodResumes);

  // FitPeriodResumes 중에서, project.skills의 모든 값을 포함하는 skills를 가진 것만 필터링.
  let FitResumes = [];
  let allSkill;

  FitPeriodResumes.forEach((resume, index) => {
    allSkill = project.skills.every((skill) => resume["skills"].includes(skill));
    if (allSkill) FitResumes.push(resume);
  });

  return res.send({ FitResumes });
});

// 매칭기능 2) 이력서에 맞는 프로젝트를 조회
router.get("/projects/:resumeId", async (req, res) => {
  //여기에, resume 작성 유저인지 확인하는 부분도 만들 것.
  const { resumeId } = req.params;
  let resume;
  let FitPeriodProjects;

  // 파라미터로 입력받은 resumeId 에 해당하는 resume를 MySQL에서 가져옴.
  await connection.query(`SELECT * FROM resumes WHERE resumeId = ${resumeId}`, (error, result, fields) => {
    if (error) throw error;
    resume = result;
  });
  console.log(resume);

  // MySQL DB에서, 기준이 되는 resume와 기간 조건(start, end)이 맞는 project만 가져옴.
  await connection.query(
    `SELECT * 
    FROM projects
    WHERE 
      start >= ${resume.start}
      AND
      end <= ${resume.end}`,
    (error, result, fields) => {
      if (error) throw error;
      FitPeriodProjects = result;
    }
  );
  console.log(FitPeriodProjects);

  // resume 입장에선, project 요구 skills 중 "자신이 갖지 않은 것이 없어야" 한다.
  // 이것을 SQL로 처리하기 애매해서, 1) DB query로 기간 조건만 필터링한 후, 2) 배열 메소드로 해결했다.
  let FitProjects = [];
  let allSkill;
  FitPeriodProjects.forEach((project, index) => {
    allSkill = project["skills"].every((skill, skillIndex) => resume.skills.includes(skill));
    if (allSkill) FitProjects.push(project);
  });

  return res.json({ FitProjects });
});

module.exports = router;
