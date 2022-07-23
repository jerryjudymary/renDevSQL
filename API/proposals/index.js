
const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");


const proposalController = require("./controllers/proposal.controller")

// 지원서에 면접 제안시 내 프로젝트 목록 조회

router.get("/projects", authMiddleware, proposalController.proposalProject)

// 지원서에 선택한 프로젝트 면접 제안

router.post("/:resumeId/:projectId", authMiddleware, proposalController.proposalResume)

module.exports = router;
