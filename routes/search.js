const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Project, ProjectSkill, Resume, ResumeSkill, sequelize } = require("../models");

// 프로젝트 찾기에 검색기능
router.get("/project", async (req, res) => {
  try {
    const { role, skill, start, end } = req.body;

    // const projectskills = await ProjectSkill.findAll({ attributes: ["skill"], where: { skill: { [Op.in]: skill } } });

    // const skills = projectskills.map((e) => e["skill"]);

    const project = await Project.findAll({
      include: [{ model: ProjectSkill }],
      where: {
        [Op.and]: {
          // req.body.start 보다 이상
          start: { [Op.gte]: start },
          // req.body.end 보다 이하
          end: { [Op.lte]: end },
          // skill: { [Op.eq]: skill },
        },

        // [Op.or]: {
        //   role: { [Op.eq]: role },
        // },
      },

      order: [["createdAt", "DESC"]],
    });

    // const projectSkills = project.map((project) => project.ProjectSkills.map((skill) => skill["skill"]));

    // let projects = [];

    // project.forEach((project, index) => {
    //   let projectArray = {};

    //   projectArray.projectId = project.projectId;
    //   projectArray.nickname = project.nickname;
    //   projectArray.title = project.title;
    //   projectArray.subscript = project.subscript;
    //   projectArray.role = project.role;
    //   projectArray.start = project.start;
    //   projectArray.end = project.end;
    //   projectArray.createdAt = project.createdAt;
    //   projectArray.skill = projectSkills[index];

    //   projects.push(projectArray);
    // });

    res.status(200).send({ project });
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
