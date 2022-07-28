const request = require("supertest");
const app = require("../../index.js");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models");
const { redisClient } = require("../../config/redis");

/**
 *  로그아웃 시 프로젝트 조회 - 등록 테스트 스위트
 */

describe("로그아웃 시 프로젝트 조회 - 등록 테스트", () => {

  test("/api/projects (프로젝트 전체 조회) get 요청시 한 개 이상의 목록이 응답되어야 한다.", async () => {
    const res = await request(app)
      .get("/api/projects")
      .expect(200);

    const { projects } = res.body;
    expect(projects[0].skills).toHaveLength(3);
  });

  test("/api/projects/:projectId (프로젝트 상세 조회) get 요청시 해당 패러미터 요청이 응답되어야 한다.", async () => {
    const res = await request(app).get("/api/projects/36");

    const { project } = res.body;
    expect(project.id).toEqual(41);
  });

  test('/api/projects (프로젝트 등록) 권한 없이 프로젝트 등록 요청 시 status 401이 응답되어야 한다.', async () => {
        
    const res = await request(app)
      .post("/api/projects")
      .send({
        "title": "테스트코드",
        "details": "테스트코드",
        "role": "backend",
        "start": "2022-12-15",
        "end": "2022-12-30",
        "subscript": "테스트코드",
        "schedule": ["2022-12-20 13:00:00", "2022-12-20 14:00:00"],
        "photos": [],
        "skills": [
          "Node.js",
          "MySQL",
          "Redis"
        ]
      });

      expect(res.status).toBe(401);
  });
});

/**
 *  로그인 시 프로젝트 POST - DELETE, PUT 테스트 스위트
 */

describe("로그인 시 프로젝트 POST - DELETE, PUT 테스트", () => {

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
  
  test('/api/projects (프로젝트 등록) 로그인 후 프로젝트 등록 요청 시 status 200이 응답되어야 한다.', async () => {
        
    const res = await request(app)
      .post("/api/projects")
      .set('authorization', token)
      .send({
        "title": "테스트코드",
        "details": "테스트코드",
        "role": "backend",
        "start": "2022-12-15",
        "end": "2022-12-30",
        "subscript": "테스트코드",
        "schedule": ["2022-12-20 13:00:00", "2022-12-20 14:00:00"],
        "photos": [],
        "skills": [
          "Node.js",
          "MySQL",
          "Redis"
        ]
      });

    expect(res.status).toBe(200);
  });

  test('/api/projects/:projectId (프로젝트 삭제) 로그인 후 프로젝트 삭제 시 status 200이 응답되어야 한다.', async () => {

    const query = `SELECT projectId FROM project WHERE id=45 ORDER BY projectId DESC LIMIT 1`
    const queryReturn = await sequelize.query(query, { type: QueryTypes.SELECT });
    const projectId = queryReturn[0].projectId

    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('authorization', token)
    
    expect(res.status).toBe(200);
  });

  test('/api/projects/:projectId (프로젝트 수정) 로그인 후 프로젝트 수정 요청 시 status 200이 응답되어야 한다.', async () => {
        
    const res = await request(app)
      .put("/api/projects/138")
      .set('authorization', token)
      .send({
        "title": "수정기능테스트코드",
        "details": "임의삭제 금지!",
        "role": "backend",
        "start": "2022-12-15",
        "end": "2022-12-30",
        "subscript": "테스트코드",
        "applications": [
          {
            "schedule": "2022-02-02 18:00:00",
            "available": 1,
          },
          {
            "schedule": "2022-02-02 17:00:00",
            "available": 1,
          },
          {
            "schedule": "2022-02-02 15:00:00",
            "available": 0,
          }
        ],
        "photos": [],
        "skills": [
          "Node.js",
          "MySQL",
          "Redis"
        ]
      });

    expect(res.status).toBe(200);
  });

});


afterAll(async () => {
  await redisClient.quit();
});