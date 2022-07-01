const Project = require("../models/project");
const Resume = require("../models/resume");

// 매칭기능 1) 프로젝트에 맞는 이력서를 조회
router.get("/resumes/:projectId", async (req, res) => {
  //여기에, 현재 로그인 user가 project 작성 유저인지 확인하는 부분도 만들 것.

  const { projectId } = req.params;
  const project = await Project.findOne({ projectId });

  const FitResumes = await Resume.find({
    start: { $lte: project.start },
    end: { $gte: project.end },
    skills: { $all: project.skills }, // project 입장에선, 요구 스킬을 "모두" 가진 resume를 찾는다.
  });

  return res.json({ FitResumes });
});

// 매칭기능 2) 이력서에 맞는 프로젝트를 조회
router.get("/projects/:resumeId", async (req, res) => {
  //여기에, resume 작성 유저인지 확인하는 부분도 만들 것.

  const { resumeId } = req.params;
  const resume = await Resume.findOne({ resumeId });

  // resume 입장에선, project 요구 skills 중 "자신이 갖지 않은 것이 없어야" 한다.
  // 이것을 mongoDB query로 처리하기 애매해서, 1) DB query로 기간 조건만 필터링한 후, 2) 배열 메소드로 해결했다.

  let FitProjects = new Array();
  const FitPeriodProjects = await Project.find({
    start: { $gte: resume.start },
    end: { $lte: resume.end },
  });

  let ox;
  FitPeriodProjects.forEach((project, index) => {
    ox = FitPeriodProjects[index]["skills"].every((skill, skillIndex) => resume.skills.includes(FitPeriodProjects[index]["skills"][skillIndex]));
    if (ox) FitProjects.push(FitPeriodProjects[index]);
  });

  return res.json({ FitProjects });
});
