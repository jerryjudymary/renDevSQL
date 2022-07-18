const express = require("express")
const router = express.Router()

const userRouter = require("../API/users")
const applicationsRouter = require("../API/applications")
const matchesRouter = require("../API/matches")
const projectsRouter = require("../API/projects")
const resumesRouter = require("../API/resumes")
const searchRouter = require("../API/search")

router.use("/users", userRouter)
router.use("/applications", applicationsRouter)
router.use("/matches", matchesRouter)
router.use("/projects", projectsRouter)
router.use("/resumes", resumesRouter)
router.use("/search", searchRouter)

module.exports = router