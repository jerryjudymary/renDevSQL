const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Project, ProjectSkill, Resume, ResumeSkill, sequelize } = require("../models");

router.get("/project", async (req, res) => {
  try {
    const { skill, start, end } = req.query;
    console.log(typeof start);
    console.log(typeof end);
    console.log(typeof skill);
    const projects = await Project.findAll({
      include: [{ model: ProjectSkill, attributes: ["skill"] }],
      where: { start: { [Op.lte]: end }, end: { [Op.gte]: start }, skill: { [Op.like]: `'%${skill}'` } },
      order: [["createdAt", "DESC"]],
    });
    console.log(projects);
    res.status(200).send({ projects });
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
});
router.get("/resume", async (req, res) => {
  const { skill, start, end } = req.query;
});
module.exports = router;
