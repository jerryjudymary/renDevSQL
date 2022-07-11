const express = require("express");
const { date } = require("joi");
const router = express.Router();
const { Op } = require("sequelize");
const { Project, ProjectSkill, Resume, ResumeSkill, sequelize } = require("../models");

// 프로젝트 찾기에 검색기능
router.get("/project", async (req, res) => {
  try {
    const { role, skill, start, end } = req.body;

    const projectsQuery = await Project.findAll({
      include: [{ model: ProjectSkill, attributes: ["skill"] }],
      where: {
        start: { [Op.gte]: start },
        end: { [Op.lte]: end },
        skill: { [Op.in]: skill },
        // [Op.or]: [{ start: { [Op.lte]: start } }, { end: { [Op.lte]: end } }],
        // [Op.or]: [{ start: { [Op.gte]: start } }, { end: { [Op.gte]: end } }],
      },
      order: [["createdAt", "DESC"]],
    });

    const projectSkills = projectsQuery.map((project) => project.ProjectSkills.map((skill) => skill["skill"]));

    let projects = [];

    projectsQuery.forEach((project, index) => {
      let projectArray = {};

      projectArray.projectid = project.projectId;
      projectArray.nickname = project.nickname;
      projectArray.title = project.title;
      projectArray.subscript = project.subscript;
      projectArray.role = project.role;
      projectArray.start = project.start;
      projectArray.end = project.end;
      projectArray.createdAt = project.createdAt;
      projectArray.skills = projectSkills[index];

      projects.push(projectArray);
    });

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
