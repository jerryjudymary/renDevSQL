const express = require("express");
const { date } = require("joi");
const router = express.Router();
const { Op } = require("sequelize");
const { Project, ProjectSkill, Resume, ResumeSkill, sequelize } = require("../models");

router.get("/project", async (req, res) => {
  try {
    const { role, skill, start, end } = req.body;

    const projects = await Project.findAll({ include: [{ model: ProjectSkill, attribute: ["skill"] }] }).map((skills) => skills.get({ raw: true }));
    // const projects = await ProjectSkill.findAll({ attributes: ["skill"] });
    console.log("projects 출력:", projects);

    // [{skill}, {skill}]부분을 -> [skill, skill]로 map함수를 사용하여 새로 정의
    // const projectskills = projects.map((resume) => resume.ProjectSkills.map((skill) => skill["skill"]));
    // const projectskills = projects.map((ProjectSkills) => (ProjectSkills) => ProjectSkills["skill"]);
    // console.log("project skill 만 출력 :", projectskills);

    // const startdate = new date(start);
    // const enddate = new date(end);

    // console.log(typeof startdate);
    // console.log(typeof enddate);

    const proskill = projects.map((skills) => skills["skill"]);

    const projectserch = await Project.findAll({
      include: [{ model: ProjectSkill, where: { skill: proskill }, attributes: ["skill"] }],
      where: {
        [Op.or]: [{ start: { [Op.lte]: start } }, { end: { [Op.lte]: end } }],
        [Op.or]: [{ start: { [Op.gte]: start } }, { end: { [Op.gte]: end } }],
        // skill: proskill,
      },
      order: [["createdAt", "DESC"]],
    });
    // console.log("project skill 만 출력 :", proskill);

    // console.log(projectserch);

    res.status(200).send({ projectserch });
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: "조회 실패" });
  }
});
router.get("/resume", async (req, res) => {
  const { skill, start, end } = req.query;
});
module.exports = router;
