const express = require("express");
const Joi = require("joi");

exports.postUsersSchema = Joi.object({
  userId: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  nickname: Joi.string().pattern(new RegExp("^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{2,8}$")).required(),
  // 한글,영어,숫자포함 가능 2~8자
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{4,16}$/))
    .required(),
  // 한글,영어,숫자, 특수문자 포함 가능 4~16자
  passwordCheck: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{4,16}$/))
    .required(),
  // 한글,영어,숫자, 특수문자 포함 가능 4~16자
  phone: Joi.string()
    .pattern(new RegExp(/^[0-9]{3}-[0-9]{4}-[0-9]{4}/))
    .required(),
  // 숫자(2~3자리) - 숫자(3~4자리) - 숫자(4자리)
  birth: Joi.string()
    .pattern(new RegExp(/^(19[0-9][0-9]|20\d{2})-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/))
    .required(),
  // 19xx || 20xx년 - xx월 -- xx일
  name: Joi.string().pattern(new RegExp("^[ㄱ-ㅎ|가-힣|a-z|A-Z|]{2,10}$")).required(),
  // 한글,영어포함 가능 2~10자 (한글이름 2자, 영어이름 고려 10자)
  policy: Joi.boolean().required(),
});

exports.postLoginSchema = Joi.object({
  userId: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{4,16}$/))
    .required(),
  // 한글,영어,숫자, 특수문자 포함 가능 4~16자
});

exports.postNicknameSchema = Joi.object({
  nickname: Joi.string().pattern(new RegExp("^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{2,8}$")).required(),
});

exports.postUserIdSchema = Joi.object({
  userId: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
    .required(),
});
