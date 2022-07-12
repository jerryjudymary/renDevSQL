const express = require("express");

require("dotenv").config();

const { 
    User,
    Project,
    Application,
    ProjectSkill,
    Resume,
    ResumeSkill,
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
              where : { id: user.id },
              attributes:['schedule', 'status','interviewCode']
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
        // const proApp = project.map(data => data.Applications.map(data2 => [data2['schedule'], data2['status'], data2['interviewCode']]))

        const Pro = []
        project.forEach((data, idx) => {
            let projects = {}
            projects.nickname = data.nickname
            projects.title = data.title
            projects.details = data.details
            projects.role = data.role
            projects.start = data.start
            projects.end = data.end
            projects.createdAt = data.createdAt    
            projects.ProjectSkills = proSkills[idx]
            projects.Applications = data.Applications

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
      
      const project = await Project.findAll({ where: { id : user.id }, include :
        [ 
          {
            model: ProjectSkill
          }
        ]
      })

      if(!project){
        return res.status(401).send({ errorMessage: "내 Project를 찾을 수 없습니다."})
      }

      const proId = project.map(data => data.projectId)

      if(!user){
          return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
      };

      const app = await Application.findAll({ where: { projectId : proId }})

      if(!app){
        return res.status(400).send({ errorMessage: "내 Project에 지원기록을 찾을 수 없습니다."})
      }

      const apps = app.map(data => data.resumeId)

      const Res = await Resume.findAll({ where: { resumeId : apps}})

      if(!Res){
        return res.status(400).send({ errorMessage: "지원서를 찾을 수 없습니다."})
      }

      // Application과 관계를 맺은 테이블 Project, Resume
      // 지원자 status의 nickname, role은 resume nickname role이다.
      // 한개의 App당 하나의 project 정보와 선별된 resume정보가 담겨야 한다.
      // 이 프로젝트에 지원한 resume를 어떻게 Resume테이블에서 긁어오나?
      // App에 담긴 resume Id로 긁어온다.
      // 해야할일은 먼저 app을 매핑하는 것

      const resumeId = Res.map( data => data.resumeId )
  
      const App = await Application.findAll({ where: { projectId : proId } ,
        include : [
          {
            model : Project,
            attributes: ['nickname', 'title', 'details', 'role', 'start', 'end', 'createdAt']
          },
          {
            model: Resume,
            where: { resumeId : resumeId},
            attributes: ['nickname', 'role']
          }
        ]   
      });

    const proSkills = project.map(data => data.ProjectSkills.map(data2 => data2["skill"]))
    
    const Apps = []
        App.forEach((data, idx) => {
            let projects = {}
            
            projects.schedule = data.schedule
            projects.available = data.available
            projects.status = data.status
            projects.interviewCode = data.interviewCode
            projects.Project = data.Project
            projects.Resume = data.Resume
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
