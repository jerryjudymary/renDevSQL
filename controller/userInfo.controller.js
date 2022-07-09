const express = require("express");

require("dotenv").config();

const { 
    User,
    Project,
    Application,
    ProjectSkill,
    Resume
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
  
        const project = await Project.findAll({ where : { id: user.id } })
  
        if(!project){
          return res.status(401).send({ errorMessage: "내가 작성한 Project가 없습니다."})
        }
        // const sql = "SELECT * FROM user A INNER JOIN project B on A.userId = B.userId where A.userId=?; ";
        // db.query(sql, userId, (err, result) => {
        //   if (err) {
        //     console.log(err);
        // }
        //   return res.status(200).send({ Projects: result });
        // });
        return res.status(200).send({ message : project });
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
        // const sql = "SELECT * FROM user A INNER JOIN project B on A.userId = B.userId where A.userId=?; ";
        // db.query(sql, userId, (err, result) => {
        //   if (err) {
        //     console.log(err);
        // }
        //   return res.status(200).send({ Projects: result });
        // });
        return res.status(200).send( resume );
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
        
        // const status = apply.map( data => [data.applicationId, data.status]);
   
        return res.status(200).send(project)
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
      console.log("Id입니다" , proId)
  
      if(!user){
          return res.status(401).send({ errorMessage: "존재하지 않는 유저입니다."}); 
      };
      console.log("user" , user)
      console.log("project" , project)
  
  
      const App = await Application.findAll({ where: { projectId : proId } ,
        include : [
          {
            model : Project,
          }
        ]   
      });
   
      // 프로젝트들에 대한 유저들의 지원상태
      // 프로젝트 Id를 기준으로 reserve된 id를 모두 가져와야한다.
      // 프로젝트 Id 1개당 1개의 지원서를 불러와야 한다. 
  
      return res.status(200).send({ "App" : App })
  
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
