const resumeController = require("../../API/resumes/controllers/resume.controller");
const { Resume, ResumeSkill } = require("../../models");
const httpMocks = require("node-mocks-http");
const newResume = require("../data/new-resume.json");

// model 에서 exports된 모델을 jest.fn() <- mock 함수를 이용하여 불러옴
Resume.create = jest.fn();
ResumeSkill.create = jest.fn();

// node-mocks-http 라이브러리를 이용하여 Express.js 애플리케이션 라우팅 함수를 테스트하기 위한 Http(request, response) 객체를 생성
// beforeEach 여러 개의 테스트에 공통된 Code가 있다면 beforeEach 안에 넣어서 반복을 줄여준다.
// let req, res, next;
beforeEach(() => {
  req = httpMocks.createRequest();
  res = httpMocks.createResponse();
  next = null;
});

describe("팀원 찾기 등록 테스트", () => {
  // describe안에 있는 beforeEach는 describe안에서만 작동
  beforeEach(() => {
    req.body = newResume;
  });

  it("등록 함수 테스트", () => {
    expect(typeof resumeController.resume).toBe("function");
  });

  //   it("Resume.create 모델 호출", () => {
  //     resumeController.resume(req, res, next);

  //     // expect와 matcher(toBeCalledWitd)를 통해서 데이터베이스에 데이터가 되는 부분 코드 테스트
  //     expect(Resume.create).toBeCalledWith(newResume);
  //     expect(ResumeSkill.create).toBeCalledWith(newResume.skill);
  //   });

  //   it("상태코드 200 반환 테스트", () => {
  //     resumeController.resume(req, res, next);

  //     expect(res.statusCode).toBe(200);
  //     결과값이 잘 전송됐는지 확인은 isEndCalled
  //     expect(res._isEndCalled()).toBeTruthy();
  //   });

  it("Json body의 응답값 반환", () => {
    Resume.create.mockReturnValue(newResume);
    resumeController.resume(req, res, next);
    expect(res._getJSONDate()).toStrictEqual(newResume);
  });
});

describe("팀원 찾기 전체 조회 테스트", () => {
  it("전체 조회 함수 테스트", () => {
    expect(typeof resumeController.resumeInfo).toBe("function");
  });
  //   it("Resume Model 호출 findAll({})", async () => {
  //     await resumeController.resumeInfo(req, res, next);

  //     expect(Resume.findAll).toHaveBeenCalledWith({});
  //   });
});
