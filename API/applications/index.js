const express = require("express");
const router = express.Router();
const applicationController = require("./controllers/applications.controller")
const authMiddleware = require("../../middlewares/authMiddleware");

router.put("/:applicationId", authMiddleware, applicationController.reserveApp); // 면접 예약

router.get("/resumes", authMiddleware, applicationController.appInfo); // 면접 예약시 지원서 조회

router.patch("/interviewed/:applicationId", authMiddleware, applicationController.appInterviewed); // 면접 완료 업데이트

router.patch("/matched/:applicationId", authMiddleware, applicationController.appMatched); // 마감(매칭 완료) 업데이트

router.put("/closed/:projectId", authMiddleware, applicationController.appDone); // 마감(매칭 X) 업데이트


module.exports = router;