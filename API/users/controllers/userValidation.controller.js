const express = require("express");
const Joi = require("joi");

exports.postUsersSchema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{4,16}$/))
    .required(),
  // 한글,영어,숫자, 특수문자 포함 가능 4~16자
  passwordCheck: Joi.string()
    .pattern(new RegExp(/^(?=.*[a-zA-z])(?=.*[0-9])(?=.*[$`~!@$!%*#^?&\\(\\)\-_=+]).{4,16}$/))
    .required(),
  // 한글,영어,숫자, 특수문자 포함 가능 4~16자
  policy: Joi.boolean().required(),
}).unknown(true);

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