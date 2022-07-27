const request = require("supertest");
const app = require("../../index.js");
const { sequelize } = require("../../models");

describe("프로젝트 라우터 테스트", () => {

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
      console.log(res.status)
      expect(res.status).toBe(401);
  });
});
