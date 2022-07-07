const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Resume, ResumeSkill, sequelize } = require("../models");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/projects", (req, res) => {});
router.get("/resumes", (req, res) => {});

module.exports = router;
