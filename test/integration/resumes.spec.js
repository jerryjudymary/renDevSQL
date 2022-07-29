const request = require("supertest");
const app = require("../../index.js");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models");
const { redisClient } = require("../../config/redis");

/**
 *  로그아웃 시 지원서 조회 - 등록 테스트 스위트
 */

describe("로그아웃 시 지원서 조회 - 등록 테스트", () => {

  test("/api/resumes (지원서 전체 조회) get 요청시 한 개 이상의 목록이 응답되어야 한다.", async () => {
    const res = await request(app)
      .get("/api/resumes")
      .expect(200);

    const { returnResumes } = res.body;
    expect(returnResumes[0].skills).toHaveLength(3);
  });

  test("/api/resumes/:resumeId (지원서 상세 조회) get 요청시 해당 패러미터 요청이 응답되어야 한다.", async () => {
    const res = await request(app).get("/api/resumes/123");

    const { resumes } = res.body;
    expect(resumes.nickname).toEqual('jerry');
  });

  test('/api/resumes (지원서 등록) 권한 없이 지원서 등록 요청 시 status 401이 응답되어야 한다.', async () => {
        
    const res = await request(app)
      .post("/api/resumes")
      .send({
        "content": "테스트코드",
        "start": "2022-07-10",
        "end": "2022-09-20",
        "role": "backend",
        "skills":["Java","PHP"],
        "resumeImage": "",
        "content2": "https://github.com/engin9803/node-abstract-site.git",
        "content3": "테스트코드"
      })

      expect(res.status).toBe(401);
  });
});

/**
 *  로그인 시 지원서 POST - DELETE, PUT 테스트 스위트
 */

describe("로그인 시 지원서 POST - DELETE, PUT 테스트", () => {

  let token = ''

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
          userId: 'jerryjudymary@gmail.com',
          password: 'judymary123!',
      })
      .expect(200)
    token = `Bearer ${res.body.token}`
  });
  
  test('/api/resumes (지원서 등록) 로그인 후 지원서 등록 요청 시 status 200이 응답되어야 한다.', async () => {
        
    const res = await request(app)
      .post("/api/resumes")
      .set('authorization', token)
      .send({
        "content": "테스트코드",
        "start": "2022-07-10",
        "end": "2022-09-20",
        "role": "backend",
        "skills":["Java","PHP"],
        "resumeImage": "",
        "content2": "https://github.com/engin9803/node-abstract-site.git",
        "content3": "테스트코드"
      })

    expect(res.status).toBe(200);
  });

  test('/api/resumes/:resumeId (지원서 삭제) 로그인 후 지원서 삭제 시 status 200이 응답되어야 한다.', async () => {

    const query = `SELECT resumeId FROM resume WHERE id=45 ORDER BY resumeId DESC LIMIT 1`
    const queryReturn = await sequelize.query(query, { type: QueryTypes.SELECT });
    const resumeId = queryReturn[0].resumeId

    const res = await request(app)
      .delete(`/api/resumes/${resumeId}`)
      .set('authorization', token)
    
    expect(res.status).toBe(200);
  });

  test('/api/resumes/:resumeId (지원서 수정) 로그인 후 지원서 수정 요청 시 status 200이 응답되어야 한다.', async () => {
        
    const res = await request(app)
      .put("/api/resumes/123")
      .set('authorization', token)
      .send({
        "content": "테스트코드 수정금지입니다",
        "start": "2022-07-10",
        "end": "2022-09-20",
        "role": "backend",
        "skills":["Java","PHP", "JavaScript"],
        "content2": "https://github.com/engin9803/node-abstract-site.git",
        "content3": "테스트코드 수정금지입니다"
      });

    expect(res.status).toBe(200);
  });

});


afterAll(async () => {
  await redisClient.quit();
});