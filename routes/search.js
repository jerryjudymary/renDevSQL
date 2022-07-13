const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Project, ProjectSkill, Resume, ResumeSkill, sequelize } = require("../models");

// 프로젝트 찾기에 검색기능
router.get("/project", async (req, res) => {
  try {
    const { role, skill, start, end } = req.body;

    const project = await Project.findAll({
      include: { model: ProjectSkill },
      where: {
        [Op.and]: [
          // req.body.start 보다 이상
          { start: { [Op.gte]: start } },
          // req.body.end 보다 이하
          { end: { [Op.lte]: end } },
        ],
      },
      order: [["createdAt", "DESC"]],
    });

    const projectSkills = project.map((project) => project.ProjectSkills.map((skill) => skill["skill"]));

    // start - end 검색된 상태
    let projects = [];

    project.forEach((project, index) => {
      let projectObject = {};

      projectObject.projectId = project.projectId;
      projectObject.nickname = project.nickname;
      projectObject.title = project.title;
      projectObject.subscript = project.subscript;
      projectObject.role = project.role;
      projectObject.start = project.start;
      projectObject.end = project.end;
      projectObject.createdAt = project.createdAt;
      projectObject.skill = projectSkills[index];

      projects.push(projectObject);
    });

    // console.log(projects);

    // function skillFilter(inputItems, requiredSkills) {
    //   let skillFilteredItems = [];
    //   let allSkill;
    //   inputItems.forEach((item) => {
    //     allSkill = requiredSkills.every((specificSkill) => item["skills"].includes(specificSkill));
    //     if (allSkill) skillFilteredItems.push(item);
    //   });
    //   return skillFilteredItems;
    // }

    // start와 end가 검색된 상태
    if (start && end && role && !skill) {
      let projectsrole = [];
      project.forEach((roleproject, index) => {
        let projectObject = {};

        projectObject.projectId = roleproject.projectId;
        projectObject.nickname = roleproject.nickname;
        projectObject.title = roleproject.title;
        projectObject.subscript = roleproject.subscript;
        projectObject.role = roleproject.role;
        projectObject.start = roleproject.start;
        projectObject.end = roleproject.end;
        projectObject.createdAt = roleproject.createdAt;
        projectObject.skill = projectSkills[index];

        projectsrole.push(projectObject);
      });
      console.log(projectsrole);
      return res.status(200).send({ projectsrole });
    }

    res.status(200).send({ projects });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: "조회 실패" });
  }
});

// 팀원 찾기에 검색기능
router.get("/resume", async (req, res) => {
  const { skill, start, end } = req.query;
});
module.exports = router;
