const moment = require("moment");
const { Project, Application, ProjectSkill, Resume, Proposal } = require("../../../models");
const { InterviewProposal } = require("../../../API/applications/controllers/notices.controller");
  

// 지원서에 면접 제안시 내 프로젝트 목록 조회
  
exports.proposalProject = async (req, res) => {
  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 상태가 아닙니다." });
  };

  const { id } = res.locals.user;
  const projectsQuery = await Project.findAll({
    where: { id },
    include: [{
      model: ProjectSkill,
      attributes:['skill'],
      required: true // 자식 테이블로 ProjectSkill row가 존재하는 projects만 불러옵니다
    },
    {
      model: Application,
      attributes:['applicationId', 'schedule','available','status','interviewCode'],
    }]
  });

  if (!projectsQuery || !projectsQuery.length) { 
    return res.status(404).json({ errorMessage: "내 프로젝트가 존재하지 않습니다." });
  };

  const projectSkills = projectsQuery.map(project => project.ProjectSkills.map( skill => skill["skill"] ));

  let projects = [];

  projectsQuery.forEach((project, index) => {
    let createdAt = moment(project.createdAt).format("YYYY-MM-DD HH:mm:ss");
    let projectObject = {};

    projectObject.projectid = project.projectId;
    projectObject.nickname = project.nickname;
    projectObject.title = project.title;
    projectObject.subscript = project.subscript;
    projectObject.role = project.role;
    projectObject.start = project.start;
    projectObject.end = project.end;
    projectObject.createdAt = createdAt; 
    projectObject.skills = projectSkills[index];
    projectObject.applications = project.Applications;

    projects.push(projectObject);
  });   
  res.send({ projects });
};

// 지원서에 선택한 프로젝트 면접 제안

exports.proposalResume = async (req, res) => {

  if (!res.locals.user) {
    return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });
  };

  const { resumeId, projectId } = req.params;
  const { id } = res.locals.user;

  const existResume = await Resume.findOne({
    where: { resumeId }
  });

  const existProject = await Project.findOne({
    where: { projectId, id }
  });

  const existProposal = await Proposal.findOne({
    where: { resumeId, projectId }
  });

  if(!existResume) {
    return res.status(404).json({ errorMessage: "해당 이력서가 존재하지 않습니다." });
  };

  if(!existProject) {
    return res.status(404).json({ errorMessage: "나의 프로젝트가 존재하지 않습니다." });
  };

  if(existResume.id === id) {
    return res.status(403).json({ errorMessage : '자신의 이력서에는 제안할 수 없습니다.' });
  };

  if(existProposal) {
    if(existProposal.proposalCount === 0) {
      await Proposal.update({ proposalCount: 1 }, { where: { resumeId, projectId } });
      InterviewProposal (projectId, resumeId);
      return res.status(200).json({ message : '두 번째 메일을 보냈습니다. 제안은 한 이력서에 세 번만 가능합니다.' });
    };

    if(existProposal.proposalCount === 1) {
      await Proposal.update({ proposalCount: 2 }, { where: { resumeId, projectId } });
      InterviewProposal (projectId, resumeId);
      return res.status(200).json({ message : '세 번째 메일을 보냈습니다. 해당 이력서에 더 이상 제안할 수 없습니다.' });
    };

    if(existProposal.proposalCount === 2) {
      return res.status(403).json({ errorMessage : '해당 이력서에 더 이상 제안 메일을 보내실 수 없습니다.' });
    };
  };

  await Proposal.create({ resumeId, projectId });

  InterviewProposal (projectId, resumeId); // 제안 상대에게 이메일 발송

  res.status(200).send({ message : '📧 해당 이력서에 제안 메일을 발송했습니다.한 이력서에 세 번만 보내실 수 있습니다.' });

};