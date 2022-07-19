// request로 가져오는게 관행
const request = require("supertest");
const app = require("../../index.js");
const { sequelize } = require("../../models");
const newResume = require("../data/new-resume.json");

beforeAll(async () => {
  await sequelize.sync({});
});

if (
  ("POST /api/resumes",
  async () => {
    const response = await request(app).post("/api/resumes").send(newResume);
    expect(response.statusCode).toBe(200);
    expect(response.body.content).toBe(newResume.content);
    expect(response.body.start).toBe(newResume.start);
    expect(response.body.end).toBe(newResume.end);
    expect(response.body.role).toBe(newResume.role);
    expect(response.body.skill).toBe(newResume.skill);
    expect(response.body.content2).toBe(newResume.content2);
    expect(response.body.content3).toBe(newResume.content3);
  })
);

describe("팀원찾기 라우터 테스트", () => {
  it("GET /api/resumes (팀원 전체 조회)", async () => {
    const res = await request(app).get("/api/resumes");

    const { returnResumes } = res.body;
    expect(returnResumes[0]).toBeTruthy();
  });
});
