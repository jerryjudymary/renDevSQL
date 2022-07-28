const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const resumeController = require("./controllers/resume.controller");

// 팀원 찾기 등록
router.post("/", authMiddleware, resumeController.resume);

// 팀원 찾기 전체 조회
router.get("/", resumeController.resumeInfo);

// 팀원 찾기 상세조회
router.get("/:resumeId", resumeController.resumeDetail);

// 팀원 찾기 정보 수정
router.put("/:resumeId", authMiddleware, resumeController.resumeUpdate);

// 팀원 찾기 정보 삭제
router.delete("/:resumeId", authMiddleware, resumeController.resumeDelete);

module.exports = router;
