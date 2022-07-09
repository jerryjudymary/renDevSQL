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

    const projectskill = await Project.findAll({ include: [{ model: ProjectSkill, attribute: ["skill"] }] });

    const projectserch = await Project.findAll({
      where: {
        [Op.and]: {
          start: { [Op.lte]: end },
          end: { [Op.gte]: start },
          skill: projectskill.map((skills) => skills.skill),
        },
      },
      order: [["createdAt", "DESC"]],
    });

    console.log(projectserch);

    res.status(200).send({ projectserch });
  } catch (error) {
    console.log(error);
    res.status(400).send({});
  }
});
router.get("/resume", async (req, res) => {
  const { skill, start, end } = req.query;
});
module.exports = router;
