const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const matcheController = require("./controllers/matches.controller");

// "Resume의 조건에 맞는 Projects" 매칭 API
router.get("/projects/:resumeId", authMiddleware, matcheController.projectMatches);

// "Project의 조건에 맞는 Resumes" 매칭 API
router.get("/resumes/:projectId", authMiddleware, matcheController.resumeMatches);

module.exports = router;
