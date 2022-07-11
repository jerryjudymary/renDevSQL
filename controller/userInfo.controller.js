const express = require("express");

require("dotenv").config();

const { 
    User,
    Project,
    Application,
    ProjectSkill,
    Resume,
    ProjectPhoto
}
= require("../models");

const db = require("../config/database");

const userDetail = async (req, res) => {
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
  
  const userInfo = async (req, res) => {
    try {
      const user = res.locals.user;
      if (user === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        const { userId } = res.locals.user;
  
        const users = await User.findOne({ where: { userId } });
        if (!users) {
          return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
        } else {
          return res.status(200).send({ userId: users.userId, nickname: users.nickname });
        }
      }
    } catch (err) {
      res.status(400).send({ errorMessage: "유저 정보를 찾을 수 없습니다." });
    }
  };

  const userProject = async(req,res) => {
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
  
        const project = await Project.findAll({ where : { id: user.id }, include : [
        {
            model:ProjectSkill
        },
        {
            model:ProjectPhoto
        }
        ] })

        if(!project){
          return res.status(401).send({ errorMessage: "내가 작성한 Project가 없습니다."})
        };

        const proSkills = project.map(data => data.ProjectSkills.map(data2 => data2["skill"]))

        const Pro = []
        project.forEach((data, idx) => {
            let projects = {}
            projects.projectId = data.projectId
            projects.id = data.id
            projects.nickname = data.nickname
            projects.title = data.title
            projects.details = data.details
            projects.role = data.role
            projects.start = data.start
            projects.end = data.end
            projects.createdAt = data.createdAt    
            projects.ProjectSkills = proSkills[idx]

            return Pro.push(projects)
        })

        // const sql = "SELECT * FROM user A INNER JOIN project B on A.userId = B.userId where A.userId=?; ";
        // db.query(sql, userId, (err, result) => {
        //   if (err) {
        //     console.log(err);
        // }
        //   return res.status(200).send({ Projects: result });
        // });
        return res.status(200).send({ message : Pro });
      }
    } catch (err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "Project 조회에 실패했습니다." });
      }
    }
  };
  
  const userResume =  async(req,res) => {
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
  
        const resume = await Resume.findAll({ where : { id: user.id } })
  
        if(!resume){
          return res.status(401).send({ errorMessage: "내가 작성한 Resume가 없습니다."})
        }

        const resumeSkills = resume.map(data => data.ResumeSkills.map(data2 => data2["skill"]))

        const Recruit = []
        resume.forEach((data, idx) => {
            let resumes = {}
            resumes.resumeId = data.resumeId
            resumes.id = data.id
            resumes.nickname = data.nickname
            resumes.content = data.content
            resumes.content2 = data.content2
            resumes.content3 = data.content3
            resumes.role = data.role
            resumes.start = data.start
            resumes.end = data.end
            resumes.createdAt = data.createdAt    
            resumes.ResumeSkills = resumeSkills[idx]

            return Recruit.push({message : Recruit})
        })
        // const sql = "SELECT * FROM user A INNER JOIN project B on A.userId = B.userId where A.userId=?; ";
        // db.query(sql, userId, (err, result) => {
        //   if (err) {
        //     console.log(err);
        // }
        //   return res.status(200).send({ Projects: result });
        // });
        return res.status(200).send( Recruit );
      }
    } catch (err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "Resume 조회에 실패했습니다." })
      }
    }
  };
  
  const myApply = async(req, res) => {
    try {
      const { userId } = res.locals.user;
      if(userId === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } else {
        
        const { nickname } = req.params;
  
        const user = await User.findOne({ where: { nickname } })
  
        if(!user){
          return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
        };
        
        const apply = await Application.findAll({ where : { id : user.id}});
        const proIds = apply.map( data => data.projectId);
        // const schedule = apply.map( data => [data.schedule, data.interviewCode])
        const project = await Project.findAll({ where : { projectId : proIds },
          include: [
            {
              model: Application,
              attributes:['schedule', 'status', 'applicationId', 'interviewCode']
            },
            {
              model: ProjectSkill,
              attributes:['skill', 'projectId']
            }
          ]})
          
        if(!apply){
          return res.status(401).send({ errorMessage: "지원한 프로젝트가 없습니다."})
        }

        const proSkills = project.map(data => data.ProjectSkills.map(data2 => data2["skill"]))
        const proApp = project.map(data => data.Applications.map(data2 => [data2['schedule'], data2['status'], data2['interviewCode']]))

        const Pro = []
        project.forEach((data, idx) => {
            let projects = {}
            projects.projectId = data.projectId
            projects.id = data.id
            projects.nickname = data.nickname
            projects.title = data.title
            projects.details = data.details
            projects.role = data.role
            projects.start = data.start
            projects.end = data.end
            projects.createdAt = data.createdAt    
            projects.ProjectSkills = proSkills[idx]
            projects.Applications = proApp[idx]

            return Pro.push(projects)
        })
        
        // const status = apply.map( data => [data.applicationId, data.status]);
   
        return res.status(200).send(Pro)
      }
    } catch(err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "지원현황 조회에 실패했습니다."})
      }
    }
  };
  
  const recruit = async(req, res) => {
    try {
      const { userId } = res.locals.user;
      if(userId === undefined) {
        return res.status(401).send({ errorMessage: "로그인이 필요합니다." });
      } 
      const { nickname } = req.params;
  
      const user = await User.findOne({ where: { nickname } });
      const project = await Project.findAll({ where: { id : user.id }})

      if(!project){
        return res.status(401).send({ errorMessage: "내 Project를 찾을 수 없습니다."})
      }

      const proId = project.map(data => data.projectId)
  
      if(!user){
          return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
      };
  
      const App = await Application.findAll({ where: { projectId : proId } ,
        include : [
          {
            model : Project,
          }
        ]   
      });

      if(!App){
        return res.status(401).send({ errorMessage: "지원받은 프로젝특가 없습니다."})
      }

    const proSkills = project.map(data => data.ProjectSkills.map(data2 => data2["skill"]))
    const project2 = project.map(data => [data["projectId"], data["id"], data["title"], data["details"], data["role"], data["email"],
    data["start"], data["end"], data["subscript"], data["createdAt"], data["nickname"]
    ])
    // const project3 = project2.reduce(( acc, cur) => [...acc, ...cur], [])

    const Apps = []
        App.forEach((data, idx) => {
            let projects = {}
            
            projects.applicationId = data.applicationId
            projects.projectId = data.projectId
            projects.resumeId = data.resumeId
            projects.id = data.id
            projects.schedule = data.schedule
            projects.available = data.available
            projects.status = data.status
            projects.interviewCode = data.interviewCode
            projects.Project = project2[idx]
            projects.ProjectSkills = proSkills[idx]

            return Apps.push(projects)
        })
   
      // 프로젝트들에 대한 유저들의 지원상태
      // 프로젝트 Id를 기준으로 reserve된 id를 모두 가져와야한다.
      // 프로젝트 Id 1개당 1개의 지원서를 불러와야 한다. 
  
      return res.status(200).send(Apps)
  
    } catch(err){
      if(err){
        console.log(err)
        return res.status(401).send({ errorMessage: "내 모집현황 조회에 실패했습니다."})
      }
    }
}

module.exports = {
    userInfo,
    userDetail,
    userProject,
    userResume,
    myApply,
    recruit
  };
