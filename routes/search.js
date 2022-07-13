const express = require("express");
const { exist, x } = require("joi");
const router = express.Router();
const { Op } = require("sequelize");
const {
  Project,
  ProjectSkill,
  Resume,
  ResumeSkill,
  sequelize,
} = require("../models");

// 프로젝트 찾기에 검색기능
router.get("/project", async (req, res) => {
  try {
    const { role, skill, start, end } = req.body;

    const projects = await Project.findAll({
      where: { role: role },
      include: [
        {
          model: ProjectSkill,
          attributes: ["skill"],
        },
      ],
    });
   

    const skills = projects.map((data) => data.ProjectSkills.map((data2) => data2["skill"]));

    // skills 는 role을 조건으로뽑은 project에 딸린 skill값이다.
    // 만약, 이걸 body로 들어오는 skill과 비교해서 뽑아내려면,
    // 하나라도 포함했을 경우로 데이터를 재 정렬 해야 한다.

    // role로 project만 골라서 보여준다.
    // start, end가 있다면, 기간을 통해서 필터링을 한 번 더 거친값을 리턴한다.

    // data는 기존 App의 key값이고, projects의 key값은 = data의 키값이다라는 조건으로 한바퀴 돌려서
    // 객체안에 쑤셔넣고, 객체안에 이루어진 하나의 오브젝트를 배열인 Apps에 push해 배열로 만든다.
    // 여기서 내가 해야할 건 forEach로 한바퀴돌려서 start와 end값을 뱉어내야 한다. 그것도 조건으로

    // console.log isSchedule)

    // case1 : role만 입력했을 때 => 선택한 역할군을 기준으로 선택된 role이 있는 project만을 골라서 보여준다.
    // case2 : role과 기간이 입력 됐을 때 => 선택한 role을 기준으로 body의 start와 end를 비교해 나열한다.
    // case3 : role과 기간 그리고 원하는 skill까지 입력됐을 때 =>
    // 선택한 role을 기준으로 body의 기간을 포함하는 skill들을 뱉는다.

    if (role && skill && start && end !== undefined) {
      var arraySkill = []

      arraySkill.push(skill)

      const bodySkill = arraySkill.reduce(function (acc, cur) {
        return acc.concat(cur);
      });

      const existSkill = skills.reduce(function (acc, cur) {
        return acc.concat(cur);
      });

      // console.log(skills)

      const a = [arraySkill, skills]

      
      var ress = [];

      a.forEach(el => {
        const thisObj = this;
        el.forEach(el2 => {
          
            if(thisObj[el2]){ // thisObj의 [element]가 아닐때에는 thisObj[element] = true? element = garden, canons etc..
              thisObj[el2] = false;
           }
           else{
              ress.push(el2) // true , 즉 thisObj[element]가 true일때는 그 element를 res에 push해라 el2 = [skills]
           };
        })
      })
            // const ress = [];
      // skills.forEach(el => {
      //   const thisObj = this;
      //   el.forEach(element => {
      //     if(thisObj[element] === bodySkill.forEach(x => [x])){
      //       ress.push(el)
      //     }
      //     else {
      //       thisObj[element] = false;
      //     }
      //   })
      //   return ress
      // })
      console.log(arraySkill[0][0])
      console.log(skills[0][0])
    
    
    // console.log(x)
//     hash = Object.create(null)
//     var result;

    
// arraySkill.forEach(function (a) {
//      hash[a.join('React')] = true;
// });

// result = skills.filter(function (a) {
//     return hash[a.join('React')] = true; // {[a.join('React')] = true;}
// });

// console.log(result);
      // const ress = [];
      // skills.forEach(el => {
      //   const thisObj = this;
      //   el.forEach(element => {
      //     if(thisObj[element] === bodySkill.forEach(x => [x])){
      //       ress.push(el)
      //     }
      //     else {
      //       thisObj[element] = false;
      //     }
      //   })
      //   return ress
      // })

      // console.log(ress)
    //   const arr = [
    //     ["garden","canons","philips","universal"],
    //     ["universal","ola","uber","bangalore"]
    //  ];
    //  const findMultiIntersection = (arr = []) => {
    //     const res = []; // 빈배열 res를 선언
    //     arr.forEach(el => { // 배열을 한바퀴 순회한다. 
    //        const thisObj = this;
    //        el.forEach(element => {
    //           if(!thisObj[element]){ // thisObj의 [element]가 아닐때에는 thisObj[element] = true? element = garden, canons etc..
    //              thisObj[element] = true;
    //           }
    //           else{
    //              res.push(element) // true , 즉 thisObj[element]가 true일때는 그 element를 res에 push해라
    //           };
    //        });
    //     }, {});
    //     return res;
    //  };
      
// return res엔 universal이 담긴다. 어떻게?
      

      const allBody = [];

      var arr = [];
            for (var i = 0, l = skills.length; i < l; i++) {
              if(bodySkill.every((value, x) => value === skills[i][x])){
              arr.push(skills[i]);
              
              }
            }
            console.log(arr)
            console.log(skills)
      projects.forEach((data, idx) => {

        const search = {};

    
        if (data.start >= start && data.end <= end) {
         
          const overlapSkills = bodySkill.filter(item => [skills.includes(item)])

           

            
          // console.log("overrap:", overlapSkills)

          
          // ProjectSkills는 body의 skill값과 skills의 배열 속 배열 중 일치하는 값만 배열로 리턴한다. 
          // 
        

          if (arr) {
            search.projectId = data.projectId;
            search.title = data.title;
            search.details = data.details;
            search.role = data.role;
            search.email = data.email;
            search.start = data.start;
            search.end = data.end;
            search.subscript = data.subscript;
            search.nickname = data.nickname;
            
            for(let i=0; i<arr.length;i++){
              if(skills[i] === arr[i]){
             search.ProjectSkills = skills[idx]
              }
            }
            
              

            return allBody.push(search);
          }
        }
      });

      return res.status(200).send(allBody);

    } else if (role && start && end !== undefined) {
      const isSchedule = [];
      projects.forEach((data, idx) => {
        const calender = {};
        if (data.start >= start && data.end <= end) {
          calender.projectId = data.projectId;
          calender.title = data.title;
          calender.details = data.details;
          calender.role = data.role;
          calender.email = data.email;
          calender.start = data.start;
          calender.end = data.end;
          calender.subscript = data.subscript;
          calender.nickname = data.nickname;
          
          calender.ProjectSkills = skills[idx];
          
          return isSchedule.push(calender);
        }
      });
      return res.status(200).send(isSchedule);
    } else if (role !== undefined) {
      return res.status(200).send(projects);
    } else {
      return res.status(400).send({ errorMessage: "하나 이상 선택해야 합니다." });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ errorMessage: "조회 실패" });
  }
});

// 팀원 찾기에 검색기능
router.get("/resume", async (req, res) => {
  const { skill, start, end } = req.query;
});
module.exports = router;
