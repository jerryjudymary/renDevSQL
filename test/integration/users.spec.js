const request = require("supertest");
const app = require("../../index.js");
const { QueryTypes } = require("sequelize");
const { sequelize } = require("../../models");
const { redisClient } = require("../../config/redis");

/**
 *  아이디 중복검사 - 회원가입 - 로그인 - 회원탈퇴 시나리오 테스트 스위트
 */

describe("아이디 중복검사 - 회원가입 - 로그인 - 회원탈퇴 시나리오 테스트", () => {

  test('/api/users/signup/checkUserId (아이디 중복검사) 기존 등록된 아이디를 요청할 경우 status 400이 응답되어야 한다.', async () => {
    const res = await request(app)
      .post('/api/users/signup/checkUserId')
      .send({
        "userId": "jerryjudymary@gmail.com",
      })

      expect(res.status).toBe(400);
    });

  test('/api/users/signup (회원가입) 회원 가입시 status 200이 응답되어야 한다.', async () => {
    const res = await request(app)
      .post('/api/users/signup')
      .send({
        "userId": "testament@test.com",
        "nickname": "testmen",
        "password": "iloverendev123!",
        "passwordCheck": "iloverendev123!",
        "name": "유랑뎁",
        "birth": "1995-01-11",
        "policy" : true
      })

      expect(res.status).toBe(200);
    });
  
  let token = ''

  test('/api/users/login (로그인) 로그인 요청시 status 200 응답, access token 발급, refresh token을 cookie로 전송한다.', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        userId: 'testament@test.com',
        password: 'iloverendev123!',
      })

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.headers['set-cookie'][0]).toContain('refreshToken');

    token = `Bearer ${res.body.token}`
  });

  test('/api/users/details/:nickname/delete (회원탈퇴) 회원 탈퇴시 status 200이 응답되어야 한다.', async () => {
    const res = await request(app)
      .put('/api/users/details/testmen/delete')
      .set('authorization', token)
      .send({
        "password": "iloverendev123!"
      })

    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    const query = `DELETE FROM user WHERE password='' ORDER BY id DESC LIMIT 1`
    await sequelize.query(query, { type: QueryTypes.DELETE });
  }); // 회원 탈퇴 처리(put 메서드로 더미데이터화)된 레코드 삭제

});

/**
 *  기존 유저 로그인 - 유저정보 조회 - 비밀번호 변경 시나리오 테스트 스위트
 */

describe("기존 유저 로그인 - 유저정보 조회 - 비밀번호 변경 시나리오 테스트", () => {

  let token = ''

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
          userId: 'fixuser@test.com',
          password: 'iloverendev123!',
      })
      .expect(200)
    token = `Bearer ${res.body.token}`
  });

  test('/api/users/auth (유저정보 조회) 유저정보 조회시 해당 유저의 userId, nickname, profileImage가 응답되어야 한다.', async () => {
    const res = await request(app)
      .get('/api/users/auth')
      .set('authorization', token)
 
    expect(res.body.userId).toEqual('fixuser@test.com');
    expect(res.body.nickname).toEqual('testfix');
    expect(res.body.profileImage).toEqual('');
  });

  test('/api/users/details/:nickname/updatepw (비밀번호 변경) 비밀번호 변경시 status 200이 응답되어야 한다.', async () => {
    const res = await request(app)
      .put('/api/users/details/testfix/updatepw')
      .set('authorization', token)
      .send({
        password: 'iloverendev123!',
        newPassword: 'iloverendev123!' 
      })

    expect(res.status).toBe(200);
  });

});

afterAll(async () => {
  await redisClient.quit();
});