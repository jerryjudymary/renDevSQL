const app = require("../../index.js");
const request = require("supertest");

describe("프로젝트 라우터 테스트", () => {
  test("/api/projects (프로젝트 전체 조회) get 요청시 한 개 이상의 목록이 응답되어야 한다.", async () => {
    const res = await request(app).get("/api/projects");

    const { projects } = res.body;
    expect(projects[0]).toBeTruthy();
  });
});
