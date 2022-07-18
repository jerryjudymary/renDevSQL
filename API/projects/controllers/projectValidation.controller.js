const Joi = require("joi");

const projectPostSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  // 1 ~ 100자 제한
  details: Joi.string().min(1).required(),
  // 최소 1자 이상 제한
  subscript: Joi.string().min(1).max(300).required(),
  // 1 ~ 300자 제한
  role: Joi.string().pattern(new RegExp("^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣\ ]{1,50}$")).required(),
  // 한글,영어,숫자포함 가능 1~50자
  skills: Joi.array().required(),
  // 배열
  // email: Joi.string()
  //   .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
  //   .required(),
  // // 이메일 형식 제한
  // phone: Joi.string()
  //   .pattern(new RegExp(/^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}/))
  //   .required(),
  // // 숫자(2~3자리) - 숫자(3~4자리) - 숫자(4자리)
  start: Joi.string()
    .pattern(new RegExp(/^(19[0-9][0-9]|20\d{2})-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/))
    .required(),
  // 19xx || 20xx년 - xx월 -- xx일
  end: Joi.string()
    .pattern(new RegExp(/^(19[0-9][0-9]|20\d{2})-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/))
    .required(),
  // 19xx || 20xx년 - xx월 -- xx일
  photos: Joi.array(),
  // 배열
  createdAt: Joi.string(),
  schedule: Joi.array()
});

module.exports = {
  projectPostSchema
};