const express = require("express");

require("dotenv").config();

const { 
    User,
    Project,
    Application,
    ProjectSkill,
    Resume,
    ResumeSkill,
    ProjectPhoto,
    sequelize
}
= require("../../../models");

const { QueryTypes } = require("sequelize");

exports.userDetail = async (req, res) => {
    try {
      const user = res.locals.user; 
      if (user === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        const { nickname } = req.params;
  
        const nickInfo = await User.findOne({ where: { nickname } });
        if (!nickInfo) {
          return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
        } else {
          return res.status(200).send(nickInfo);
        }
      }
    } catch (err) {
      if (err) {
        console.log(err);
        res.status(400).send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
      }
    }
  };
  
exports.userInfo = async (req, res) => {
    // try {
    //   const user = res.locals.user;
    //   if (user === undefined) {
    //     return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    //   } else {
    //     const { userId } = res.locals.user;
  
    //     const users = await User.findOne({ where: { userId } });
    //     if (!users) {
    //       return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
    //     } else {
    //       return res.status(200).send({ userId: users.userId, nickname: users.nickname, profileImage: users.profileImage });
    //     }
    //   }
    // } catch (err) {
    //   res.status(400).send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
    // }
    const user = res.locals.user;
    res.send({
      userId : user.userId,
      nickname: user.nickname,
      profileImage: user.profileImage
    })
  };

exports.userProject = async(req,res) => {
    try {
      const { userId } = res.locals.user;
      if (userId === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        const { nickname } = req.params;
  
        const user = await User.findOne({ where: { nickname: nickname } })
  
        if(!user){
          return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
        };

        const sql =
        `SELECT A.projectId, id, nickname, title, details, role, start, end, createdAt,
        JSON_ARRAYAGG(skill) as skills FROM project A INNER JOIN
        project_skill B ON A.projectId = B.projectId where A.id=${user.id} GROUP BY A.projectId`

        const projects = await sequelize.query(sql, { type: QueryTypes.SELECT });

        if(!projects){
          return res.status(401).send({ errorMessage: "내가 작성한 Project가 없습니다."})
        };

        return res.status(200).send(projects);
        // JSON_ARRAYAGG()는 원하는 항목을 JSON array로 추출한다.
        // skill이라는 key : value형태를 JSON array형태로 뱉어내기 위해 사용된다.
        // as skills 이기 때문에 출력형태는 project_skill = [ { key : value }]에서 skills : [ ]형태가 된다.
        // 그리고 조건은 project의 proId와 project_skill 테이블의 projectId 가 같을때, projectId를 기준으로
        // 그룹화를 해서 데이터를 출력한다.
        // project를 기준으로 그룹화 하기 때문에 프로젝트당 skills가 붙어서 나오는 형태가 된다.
        // 결국 JSON_ARRAYGG는 proId = project.map(data => data.projectId)
  
        // const project = await Project.findAll({ where : { id: user.id }, include : [
        // {
        //     model:ProjectSkill
        // },
        // {
        //     model:ProjectPhoto
        // }
        // ] })

        // if(!project){
        //   return res.status(401).send({ errorMessage: "내가 작성한 Project가 없습니다."})
        // };

        // const proSkills = project.map(data => data.ProjectSkills.map(data2 => data2["skill"]))

        // const Pro = []
        // project.forEach((data, idx) => {
        //     let projects = {}
        //     projects.projectId = data.projectId
        //     projects.id = data.id
        //     projects.nickname = data.nickname
        //     projects.title = data.title
        //     projects.details = data.details
        //     projects.role = data.role
        //     projects.start = data.start
        //     projects.end = data.end
        //     projects.createdAt = data.createdAt    
        //     projects.ProjectSkills = proSkills[idx]

        //     return Pro.push(projects)
        // })
        // const query = `SELECT project.projectId, nickname, title, subscript, role, start, end, createdAt,
        // JSON_ARRAYAGG(skill) AS skills ${/* inner join으로 가져오고 쿼리 말미에 그룹화하는 project_skill 테이블의 skill을 skills라는 alias로 받아옵니다. */''}
        // FROM project INNER JOIN project_skill
        // ON project.projectId = project_skill.projectId
        // GROUP BY project.projectId`; // 자식 테이블의 컬럼(skill)을 그룹화할 것이기 때문에, 자식 테이블의 FK 기준으로 GROUP BY 해야 합니다!
        // const projects = await sequelize.query(query, { type: QueryTypes.SELECT });
        
        // const sql = "SELECT * FROM user A INNER JOIN project B on A.userId = B.userId where A.userId=?; ";
        // db.query(sql, userId, (err, result) => {
        //   if (err) {
        //     console.log(err);
        // }
        //   return res.status(200).send({ Projects: result });
        // });
        // return res.status(200).send({ message : Pro });
      }
    } catch (err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "Project 조회에 실패했습니다." });
      }
    }
  };
  
exports.userResume =  async(req,res) => {
    try {
      const { userId } = res.locals.user;
      if (userId === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        const { nickname } = req.params;
  
        const user = await User.findOne({ where: { nickname: nickname } })
  
        if(!user){
          return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
        };

        const sql =
        `SELECT A.resumeId, id, nickname, content, content2, content3, role, start, end, createdAt,
        JSON_ARRAYAGG(skill) as skills FROM resume A INNER JOIN
        resume_skill B ON A.resumeId = B.resumeId where A.id=${user.id} GROUP BY A.resumeId`

        const resumes = await sequelize.query(sql, { type: QueryTypes.SELECT });

        return res.status(200).send( resumes );
        // const resume = await Resume.findAll({ where : { id: user.id } })
  
        // if(!resume){
        //   return res.status(401).send({ errorMessage: "내가 작성한 Resume가 없습니다."})
        // }

        // const resumeSkills = resume.map(data => data.ResumeSkills.map(data2 => data2["skill"]))

        // const Recruit = []
        // resume.forEach((data, idx) => {
        //     let resumes = {}
        //     resumes.resumeId = data.resumeId
        //     resumes.id = data.id
        //     resumes.nickname = data.nickname
        //     resumes.content = data.content
        //     resumes.content2 = data.content2
        //     resumes.content3 = data.content3
        //     resumes.role = data.role
        //     resumes.start = data.start
        //     resumes.end = data.end
        //     resumes.createdAt = data.createdAt    
        //     resumes.ResumeSkills = resumeSkills[idx]

        //     return Recruit.push({message : Recruit})
        // })
        // const sql = "SELECT * FROM user A INNER JOIN project B on A.userId = B.userId where A.userId=?; ";
        // db.query(sql, userId, (err, result) => {
        //   if (err) {
        //     console.log(err);
        // }
        //   return res.status(200).send({ Projects: result });
        // });
        // return res.status(200).send( Recruit );
      }
    } catch (err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "Resume 조회에 실패했습니다." })
      }
    }
  };
  
exports.myApply = async(req, res) => {
    try {
      const user = res.locals.user;
      if(user === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        
        // applications라는 데이터를 불러오기 위해서 from 절로 project A라는 형식대신 서브쿼리문이 들어감
        // 서브쿼리문의 경우 무조건 alias를 붙여줘야 하기 때문에, project_photos가 mainQ로 명명된다.
        // 인라인 뷰 서브쿼리의 경우 FROM (서브쿼리) alias 형태가 되는 것 같다.
        // FROM project A INNER JOIN project_skill B 원래ㅔ는 이런 형태인데 from (서브쿼리) alias 이런형태로 바뀜
        
        // from (서브쿼리) alias => 이형태가 하나의 테이블처럼 적용 그리고 테이블 이름이 alias인것처럼 from부터 구분 
        // 그러면 as applications 이후 from ( ~ ) secondQ까지의 from ( ~ ) 가 seconQ값이 된다. 일종의 테이블처럼
        // B의 모든값은 project.*, JSON_ARRAYAGG(skill) as skills(프로젝트 ID로 그룹화한) 
        // 그리고 B의 모든값과 프로젝트 photo를 이너조인해서 photo값만 arrayagg한 값을 포함한 값이
        // A가되고, A와 application (프로젝트 ID로 그룹화한) 값을 최종적으로 출력하게 된다.

        // user의 id값을 기준으로 app에서 projectId를 뽑아낸다. 
        // 그리고 project에서 위에서 뽑아낸 projectId를 기준으로 데이터를 가져오는데, app의 id는 user의 id이다.
    const sql2 = `SELECT A.projectId FROM application A inner join user B ON A.id = B.id where A.id=${user.id}`
    const apply = await sequelize.query(sql2, { type: QueryTypes.SELECT });
    const proId = apply.map(data => data.projectId).toString()
    
    if(proId){
      const sql =
      `SELECT A.*, JSON_ARRAYAGG(JSON_OBJECT( 
       'applicationId', E.applicationId, 'available', E.available,
       'schedule', DATE_FORMAT(E.schedule,'%Y-%m-%d %H:%i:%S'),
       'status', E.status, 'interviewCode', E.interviewCode, 'id', E.id)) AS applications
       FROM( SELECT B.* FROM( SELECT C.*, JSON_ARRAYAGG(skill) AS ProjectSkills FROM project C
       INNER JOIN project_skill D ON C.projectId = D.projectId where C.projectId IN (${proId}) GROUP BY C.projectId) B
       ) A INNER JOIN application E ON A.projectId = E.projectId where E.id IN (${user.id}) GROUP BY E.applicationId`; 

    const projects = await sequelize.query(sql, { type: QueryTypes.SELECT });

    return res.status(200).send(projects)
      } else {
        return res.status(401).send({ errorMessage: "아직 내가 지원한 프로젝트가 없습니다."})
      }
    // const { nickname } = req.params;
  
        // const user = await User.findOne({ where: { nickname } })
  
        // if(!user){
        //   return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
        // };

        // const apply = await Application.findAll({ where : { id : user.id}});
        // const proIds = apply.map( data => data.projectId);
        // // const schedule = apply.map( data => [data.schedule, data.interviewCode])
        // const project = await Project.findAll({ where : { projectId : proIds },
        //   include: [
        //     {
        //       model: Application,
        //       where : { id: user.id },
        //       attributes:['schedule', 'status','interviewCode']
        //     },
        //     {
        //       model: ProjectSkill,
        //       attributes:['skill', 'projectId']
        //     }
        //   ]})
          
        // if(!apply){
        //   return res.status(401).send({ errorMessage: "지원한 프로젝트가 없습니다."})
        // }

        // const proSkills = project.map(data => data.ProjectSkills.map(data2 => data2["skill"]))
        // // const proApp = project.map(data => data.Applications.map(data2 => [data2['schedule'], data2['status'], data2['interviewCode']]))

        // const Pro = []
        // project.forEach((data, idx) => {
        //     let projects = {}
        //     projects.nickname = data.nickname
        //     projects.title = data.title
        //     projects.details = data.details
        //     projects.role = data.role
        //     projects.start = data.start
        //     projects.end = data.end
        //     projects.createdAt = data.createdAt    
        //     projects.ProjectSkills = proSkills[idx]
        //     projects.Applications = data.Applications

        //     return Pro.push(projects)
        // })
        
        // // const status = apply.map( data => [data.applicationId, data.status]);
   
        // return res.status(200).send(Pro)
      }
    } catch(err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "지원현황 조회에 실패했습니다."})
      }
    }
  };
exports.recruit = async(req, res) => {
    try {
      const user = res.locals.user;
      if(user === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } 
      // user의 id값으로 user가 작성한 project를 불러온다.
      // 유저가 작성한 projectId값으로 지원서를 조회한다. => 유저의 프로젝트에 묶여있는 지원서들을 조회
      // 그리고 그 유저의 프로젝트에 묶여있는 지원서들 중 resumeId만 가져온다.
      // 그리고 그 유저의 프로젝트에 묶여있는 지원서들 중 resumeId만 가져와서 resume table을 조회한다.
      // 그리고 필터링된 resume테이블의 지원서들의 resumeId값을 뽑아낸다.
      // 그리고 application에서 user가 작성한 프로젝트들을 불러오는데, 프로젝트 지원자에 대한 정보는
      // 위에서 불러온 resumeId로 필터링하고 group화해서 가져온다.

    const sql = `select A.projectId from project A inner join user B on A.id = B.id where A.id=${user.id}`
    const query = await sequelize.query(sql, { type: QueryTypes.SELECT });
    const proId = query.map(data => data.projectId).toString()
    const sql2 = `select A.resumeId from application A inner join project B
    on A.projectId = B.projectId where A.projectId in (${proId})`
    const query2 = await sequelize.query(sql2, { type: QueryTypes.SELECT });
    const recruit = query2.map(data => data.resumeId).filter((el) => {
      return el !== null
    }).toString()
    
    if(recruit){
    const sql3 =
    `SELECT A.*, JSON_OBJECT('nickname', resume.nickname, 'role', resume.role, 'resumeId', resume.resumeId ) as Resume
    FROM (
      SELECT B.*, C.applicationId, C.schedule, C.available, C.interviewCode, C.resumeId, C.status
      FROM (
        SELECT X.projectId, id, nickname, title, details, role, start, end, createdAt,
        JSON_ARRAYAGG(skill) as ProjectSkills FROM project X INNER JOIN project_skill Y
        ON X.projectId = Y.projectId where X.projectId IN (${proId}) GROUP BY X.projectId)
      B INNER JOIN application C ON B.projectId = C.projectId where B.projectId IN (${proId}) GROUP BY C.applicationId)
    A INNER JOIN resume ON A.resumeId = resume.resumeId where A.resumeId IN (${recruit}) GROUP BY A.applicationId`

    const recruits = await sequelize.query(sql3, { type: QueryTypes.SELECT });

    return res.status(200).send(recruits);
    } else {
      return res.status(401).send({errorMessage: "아직 프로젝트에 지원한 지원자가 없습니다."})
    }

    //   const project = await Project.findAll({ where: { id : user.id }, include :
    //     [ 
    //       {
    //         model: ProjectSkill
    //       }
    //     ]
    //   })

    //   if(!project){
    //     return res.status(401).send({ errorMessage: "내 Project를 찾을 수 없습니다."})
    //   }

    //   const proId = project.map(data => data.projectId)

    //   if(!user){
    //       return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
    //   };

    //   const app = await Application.findAll({ where: { projectId : proId }})

    //   if(!app){
    //     return res.status(400).send({ errorMessage: "내 Project에 지원기록을 찾을 수 없습니다."})
    //   }

    //   const apps = app.map(data => data.resumeId)

    //   const Res = await Resume.findAll({ where: { resumeId : apps}})

    //   if(!Res){
    //     return res.status(400).send({ errorMessage: "지원서를 찾을 수 없습니다."})
    //   }

    //   // Application과 관계를 맺은 테이블 Project, Resume
    //   // 지원자 status의 nickname, role은 resume nickname role이다.
    //   // 한개의 App당 하나의 project 정보와 선별된 resume정보가 담겨야 한다.
    //   // 이 프로젝트에 지원한 resume를 어떻게 Resume테이블에서 긁어오나?
    //   // App에 담긴 resume Id로 긁어온다.
    //   // 해야할일은 먼저 app을 매핑하는 것

    //   const resumeId = Res.map( data => data.resumeId )
  
    //   const App = await Application.findAll({ where: { projectId : proId } ,
    //     include : [
    //       {
    //         model : Project,
    //         attributes: ['nickname', 'title', 'details', 'role', 'start', 'end', 'createdAt']
    //       },
    //       {
    //         model: Resume,
    //         where: { resumeId : resumeId},
    //         attributes: ['nickname', 'role']
    //       }
    //     ]   
    //   });

    // const proSkills = project.map(data => data.ProjectSkills.map(data2 => data2["skill"]))
    
    // const Apps = []
    //     App.forEach((data, idx) => {
    //         let projects = {}
            
    //         projects.schedule = data.schedule
    //         projects.available = data.available
    //         projects.status = data.status
    //         projects.interviewCode = data.interviewCode
    //         projects.Project = data.Project
    //         projects.Resume = data.Resume
    //         projects.ProjectSkills = proSkills[idx]

    //         return Apps.push(projects)
    //     })
   
    //   // 프로젝트들에 대한 유저들의 지원상태
    //   // 프로젝트 Id를 기준으로 reserve된 id를 모두 가져와야한다.
    //   // 프로젝트 Id 1개당 1개의 지원서를 불러와야 한다. 
  
    //   return res.status(200).send(Apps)
  
    } catch(err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "내 모집현황 조회에 실패했습니다."})
      }
    }
}
