const httpMocks = require("node-mocks-http");
// redis 모킹 npm redis-mock 라이브러리 사용
const redis = require("redis-mock");
const client = redis.createClient();
// jest.mock 그룹 모킹화
jest.mock("../../models");
// jest.mock 밑에 써야 모킹화 가능
const { Resume, ResumeSkill } = require("../../models");
const sequelize = require("sequelize");
const resumeController = require("../../API/resumes/controllers/resume.controller");

const locals = require("../data/locals.json");
const newResume = require("../data/new-resume.json");
// const newResumeskill = require("../data/new-resumeskill.json");
const Resumefind = require("../data/Resume-findAll.json");

// model 에서 exports된 모델을 jest.fn() <- mock 함수를 이용하여 DB와의 직접적인 연결을 안하고 가짜 DB생성
Resume.create = jest.fn();
ResumeSkill.create = jest.fn();

// node-mocks-http 라이브러리를 이용하여 Express.js 애플리케이션 라우팅 함수를 테스트하기 위한 Http(request, response) 객체를 생성
// beforeEach 여러 개의 테스트에 공통된 Code가 있다면 beforeEach 안에 넣어서 반복을 줄여준다.

let req, res, next;
beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
  res.locals.user = locals;
  // // 실행할때마다 바뀌는 시간을 고정시키기 위해 MockDate 라이브러리 사용 테스트
  // MockDate.toString();
  // // createdAt = MockDate.set(new Date("2022-07-20T13:07:50.879Z"));
});

// 여러개를 테스트항목을 묶음으로 테스트시 사용
describe("팀원 찾기 등록 테스트", () => {
  // describe안에 있는 beforeEach는 describe안에서만 작동
  beforeEach(() => {
    req.body = newResume;
  });

  it("등록 함수 테스트", () => {
    expect(typeof resumeController.resume).toBe("function");
  });

  it("Resume.create 호출", async () => {
    await resumeController.resume(req, res, next);

    // expect와 matcher(toBeCalledWitd)를 통해서 데이터베이스에 데이터가 되는 부분 코드 테스트
    // await expect(Promise.resolve(Resume.create)).resolve.toBeCalledWith(newResume);
    // Resume.create와 체이닝된 ResumeSkill.create 한번이 라도 호출이 되면 통과
    expect(Resume.create).toHaveReturned();
    // expect(ResumeSkill.create).toBeCalled();
  });

  it("팀원 찾기 등록 상태코드 200 반환", async () => {
    // 비동기 함수 테스트시 mockResolvedValue를 사용
    // Resume.create.mockReturnValue(newResume);
    Resume.create.mockResolvedValue(newResume);
    await resumeController.resume(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toStrictEqual({ message: "나의 정보를 등록 했습니다." });
  });

  it("팀원 찾기 등록 상태코드 400 반환", async () => {
    // 비동기 함수 테스트시 mockRejectedValue를 사용
    Resume.create.mockRejectedValue(newResume);
    await resumeController.resume(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toStrictEqual({ errorMessage: "등록 실패" });
  });
});
// MockDate.reset();

describe("팀원 찾기 전체 조회 테스트", () => {
  it("전체 조회 함수 테스트", () => {
    expect(typeof resumeController.resumeInfo).toBe("function");
  });

  // it("전체 조회 호출", async () => {
  //   // Resume.findAll.mockReturnValue(Resumefind);
  //   Resume.findAll.mockReturnValue(Resumefind);
  //   await resumeController.resumeInfo(req, res, next);

  //   // expect(Resume.findAll).toBeCalled();
  //   // expect(res._getData()).toStrictEqual(Resumefind);
  //   expect(res._getData()).toHaveReturned(Resumefind);
  // });

  it("팀원 찾기 전체 조회 상태코드 200 반환", async () => {
    await resumeController.resumeInfo(req, res, next);

    expect(res._getJSONData()).toStrictEqual(Resumefind);
    // expect(res.statusCode).toBe(200);
    // expect(res._isEndCalled).toBeTruthy();
    // expect(res._getData()).toBeTruthy();
  });
});
