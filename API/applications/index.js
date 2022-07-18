const express = require("express");
const router = express.Router();
const applicationController = require("./controllers/applications.controller")
const authMiddleware = require("../../middlewares/authMiddleware");

router.put("/:projectId/:applicationId", authMiddleware, applicationController.reserveApp)

router.get("/resumes", authMiddleware, applicationController.appInfo)

module.exports = router;