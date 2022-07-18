const express = require("express");
const router = express.Router();
const matcheController = require("./controllers/matches.controller")

// "Resume의 조건에 맞는 Projects" 매칭 API
router.get("/projects/:resumeId", matcheController.projectMatches)

// "Project의 조건에 맞는 Resumes" 매칭 API
router.get("/resumes/:projectId", matcheController.resumeMatches);

module.exports = router;
