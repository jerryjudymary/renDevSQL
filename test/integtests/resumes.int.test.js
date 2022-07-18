// request로 가져오는게 관행
const app = require("../../index");
const request = require("supertest");

describe("팀원찾기 라우터 테스트", () => {
  it("GET /api/resumes (팀원 전체 조회)", async () => {
    const res = await request(app).get("/api/resumes");

    const { resumes } = res.body;
    expect(resumes[0]).toBeTruthy();
  });
});
