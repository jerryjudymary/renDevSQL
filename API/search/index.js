const express = require("express");
const router = express.Router();
const searchController = require("../search/controllers/search.controller")

// 프로젝트 검색 API
router.get("/project", searchController.projectSearch)

// Resume 찾기 API
router.get("/resume",searchController.resumeSearch)

module.exports = router;
