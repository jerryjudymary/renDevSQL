const express = require("express");
const { Op } = require("sequelize");
const { User, Resume, ResumeSkill, Application, sequelize } = require("../../../models");
const { QueryTypes } = require("sequelize");
const logger = require("../../../config/logger");
const { redisClient, DEFAULT_EXPIRATION } = require("../../../config/redis");

// 팀원 찾기 등록
exports.resume = async (req, res) => {
  const { id, userId, nickname, profileImage } = res.locals.user;
  const { content, start, end, role, skills, content2, content3 } = req.body;
  // const { content, start, end, role, content2, content3 } = req.body;
  try {
    if (!userId) return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });

    if (!content || !start || !end || !role || !skills || !content2 || !content3) return res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요." });

    if (start >= end) return res.status(400).json({ errorMessage: "날짜 형식이 잘못되었습니다." });

    const resumeImage = profileImage;

    await Resume.create({ id, userId, nickname, content, start, end, role, content2, content3, resumeImage }).then((result) => {
      skills.forEach((skill) => ResumeSkill.create({ resumeId: result.resumeId, skill }));
    });

    redisClient.del(`resumes`, function (err, response) {
      if (response == 1) console.log("새 지원서 등록으로 전체조회 캐시 삭제");
    });

    res.status(200).json({ message: "나의 정보를 등록 했습니다." });
  } catch (error) {
    logger.log(error);
    res.status(400).json({ errorMessage: "등록 실패" });
  }
};

// 팀원 찾기 전체 조회
exports.resumeInfo = async (req, res) => {
  redisClient.get("resumes", async (err, data) => {
    try {
      // 레디스 서버에서 데이터 체크, 레디스에 저장되는 키 값은 projects
      if (err) logger.error(error);
      if (data) return res.status(200).json({ returnResumes: JSON.parse(data) }); // 캐시 적중(cache hit)시 response!

      const query = `SELECT resume.resumeId, nickname, content, resumeImage, start, end, role, createdAt,
        JSON_ARRAYAGG(skill) AS skills  ${/* inner join으로 가져오고 쿼리 말미에 그룹화하는 project_skill 테이블의 skill을 skills라는 alias로 받아옵니다. */ ""}
        FROM resume INNER JOIN resume_skill
        ON resume.resumeId = resume_skill.resumeId
        GROUP BY resume.resumeId`; // skill 컬럼을 그룹화하는 기준을 project 테이블의 projectId로 설정
      const returnResumes = await sequelize.query(query, { type: QueryTypes.SELECT });

      // 캐시 부적중(cache miss)시 DB에 쿼리 전송, setex 메서드로 설정한 기본 만료시간까지 redis 캐시 저장
      redisClient.setex("resumes", DEFAULT_EXPIRATION, JSON.stringify(returnResumes));

      res.status(200).json({ returnResumes }); // 이거 응답 변수명 나중에 수정하시면 밑에 레디스 stringify 안에도 바꿔주세요!
    } catch (e) {
      logger.error(e);
      res.status(404).json({ errorMessage: "정보가 존재하지 않습니다." });
    }
  });
};

// 팀원 찾기 상세조회
exports.resumeDetail = async (req, res) => {
  const { resumeId } = req.params;
  try {
    // 레디스 서버에서 데이터 체크, 레디스에 저장되는 키 값은 resumes:resumeId
    redisClient.get(`resumes:${resumeId}`, async (err, data) => {
      if (err) logger.error(err);
      if (data) return res.status(200).json({ resumes: JSON.parse(data) }); // 캐시 적중(cache hit)시 response!

      const query = `SELECT resume.resumeId, userId, nickname, content, start, end, role, content2, content3, resumeImage, createdAt,
          JSON_ARRAYAGG(skill) AS skills  ${
            /* inner join으로 가져오고 쿼리 말미에 그룹화하는 project_skill 테이블의 skill을 skills라는 alias로 받아옵니다. */ ""
          }
          FROM resume INNER JOIN resume_skill
          ON resume.resumeId = resume_skill.resumeId
          WHERE resume.resumeId = '${resumeId}'
          GROUP BY resume.resumeId`;

      const resumes = await sequelize.query(query, { type: QueryTypes.SELECT });

      if (!resumes[0]) return res.status(400).json({ errorMessage: "정보가 존재하지 않습니다." });

      // 캐시 부적중(cache miss)시 DB에 쿼리 전송, setex 메서드로 설정한 기본 만료시간까지 redis 캐시 저장
      redisClient.setex(`resumes:${resumeId}`, DEFAULT_EXPIRATION, JSON.stringify(resumes[0]));

      res.status(200).json({ resumes: resumes[0] });
    });
  } catch (error) {
    logger.error(error);
    res.status(404).json({ errorMessage: "조회 실패" });
  }
};

// 팀원 찾기 정보 수정
exports.resumeUpdate = async (req, res) => {
  const { userId } = res.locals.user;
  const { resumeId } = req.params;
  const { content, start, end, role, skills, content2, content3 } = req.body;

  try {
    const existResume = await Resume.findOne({ where: { resumeId } });

    if (userId !== existResume.userId) return res.status(400).json({ errormessage: "내 게시글이 아닙니다" });

    if (!content || !start || !end || !role || !skills || !content2 || !content3) return res.status(400).json({ errorMessage: "작성란을 모두 기입해주세요" });

    if (start >= end) return res.status(400).json({ errorMessage: "날짜 형식이 잘못되었습니다." });

    const tran = await sequelize.transaction(); // 트랙잭션 시작

    existResume.update({ content, start, end, role, content2, content3 }, { where: { resumeId } });
    // 등록 당시의 개수와 수정 당시의 개수가 다르면 update 사용 곤란으로 삭제 후 재등록 처리
    if (skills.length) {
      await ResumeSkill.destroy({ where: { resumeId }, transaction: tran });
      for (let i = 0; i < skills.length; i++) {
        await ResumeSkill.create({ resumeId, skill: skills[i] }, { transaction: tran });
      }
    }
    res.status(200).json({ message: "나의 정보를 수정했습니다." });
    await tran.commit();

    //수정시 해당 지원서, 전체조회 캐싱용 Redis 키 삭제
    redisClient.del(`resumes:${resumeId}`, `resumes`, function (err, response) {});
    // if (response == 1) logger.log("1 Redis key deleted");
    // if (response == 2) logger.log("2 Redis key deleted");
  } catch (error) {
    logger.error(error);
    res.status(400).json({ errormessage: "정보 수정 실패" });
    await tran.rollback(); // 트랜젝션 실패시 시작부분까지 되돌리기
  }
};

// 팀원 찾기 정보 삭제
exports.resumeDelete = async (req, res) => {
  try {
    const { userId } = res.locals.user;
    const { resumeId } = req.params;

    if (!userId) return res.status(401).json({ errorMessage: "로그인 후 사용하세요." });

    const existResume = await Resume.findOne({ include: [{ model: ResumeSkill, where: { resumeId } }], where: { resumeId } });

    if (userId !== existResume.userId) return res.status(400).json({ errormessage: "내 게시글이 아닙니다" });

    const existApplication = await Application.findOne({ where: { resumeId } });

    if (existApplication) return res.status(400).json({ errorMessage: "이미 지원한 지원서는 삭제할 수 없습니다." });

    await existResume.destroy({});

    // 수정시 해당 지원서, 전체조회 캐싱용 Redis 키 삭제
    redisClient.del(`resumes:${resumeId}`, `resumes`, function (err, response) {});
    // if (response == 1) console.log("1 Redis key deleted");
    // if (response == 2) console.log("2 Redis key deleted");
    // }
    // }
    res.status(200).json({ message: "나의 정보를 삭제했습니다." });
  } catch (error) {
    logger.error(error);
    res.status(400).json({ errormessage: "삭제 실패" });
  }
};
