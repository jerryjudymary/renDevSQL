const httpMocks = require("node-mocks-http");
const MockDate = require("mockdate");
const locals = require("../data/locals.json");
// jest.mock("../../models");
const { Resume, ResumeSkill } = require("../../models");
const resumeController = require("../../API/resumes/controllers/resume.controller");
const newResume = require("../data/new-resume.json");

// model 에서 exports된 모델을 jest.fn() <- mock 함수를 이용하여 불러옴
Resume.create = jest.fn();
Resume.findAll = jest.fn();

ResumeSkill.create = jest.fn();
ResumeSkill.findAll = jest.fn();

// node-mocks-http 라이브러리를 이용하여 Express.js 애플리케이션 라우팅 함수를 테스트하기 위한 Http(request, response) 객체를 생성
// beforeEach 여러 개의 테스트에 공통된 Code가 있다면 beforeEach 안에 넣어서 반복을 줄여준다.
let req, res, next;
beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
  res.locals.user = locals;
  MockDate.toString();
  createdAt = MockDate.set(new Date("2022-07-20T13:07:50.879Z"));
});

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
    // createdAt는 new Date()로 인해 경로: test/data/new-resume.json 에서 따로 빼서 작성
    expect(Resume.create).toBeCalledWith(newResume);
    // expect(ResumeSkill.create).toBeCalledWith(newResume);
  });

  it("상태코드 200 반환 테스트", async () => {
    await resumeController.resume(req, res, next);

    expect(res.statusCode).toEqual(200);
    // 결과값이 잘 전송됐는지 확인은 nodemocks-http 라이브러리에서 지원하는 isEndCalled를 사용
    expect(res._isEndCalled()).toBeTruthy();
  });

  it("팀원 찾기 등록 양식", async () => {
    // 가짜 함수가 어떠한 결과값(Return)을 반환 할지 직접 알려줄때는 mockReturnValue를 사용
    Resume.create.mockReturnValue(newResume);
    await resumeController.resume(req, res);

    expect(res._getJSONData()).toStrictEqual(newResume);
  });

  // it("에러메세지", async () => {
  //   const errorMessage = { message: "description property missing" };
  //   const rejectedPromise = Promise.reject(errorMessage);
  //   Resume.create.mockReturnValue(rejectedPromise);
  //   await resumeController.resume(req, res, next);

  //   expert(next).toBeCalledWith(errorMessage);
  // });
});

describe("팀원 찾기 전체 조회 테스트", () => {
  it("전체 조회 함수 테스트", () => {
    expect(typeof resumeController.resumeInfo).toBe("function");
  });
});

MockDate.reset();
