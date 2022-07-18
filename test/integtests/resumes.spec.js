// request로 가져오는게 관행
const app = require("../../index.js");
const { sequelize } = require("../../models");
const request = require("supertest");

beforeAll(async () => {
  await sequelize.sync({});
});

describe("팀원찾기 라우터 테스트", () => {
  it("GET /api/resumes (팀원 전체 조회)", async () => {
    const res = await request(app).get("/api/resumes");

    const { returnResumes } = res.body;
    expect(returnResumes[0]).toBeTruthy();
  });
});
