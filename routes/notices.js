const nodemailer = require("nodemailer");
const { Project, Resume, Application, sequelize } = require("../models");
const db = require("../config/database");

// npm install nodemailer

// 상황에 따라 아래 3가지 함수 중 2개 혹은 1개를 실행합니다. 
// noteProjectOwner, noteApplicant, InterviewProposal

// 위 3개의 함수는 이메일의 수신자, 제목, 내용을 작성하여 sendNotice 라는 함수에 전달하고,
// sendNotice 함수가 실제로 이메일을 전송합니다. 

// 면접 예약이 일어난 경우 noteProjectOwner 함수와 noteApplicant 함수를 실행합니다. 
// (프로젝트 기획자와 면접 신청자 양측에 면접 스케줄을 알리기 위해)

// 면접과 관계없이, 프로젝트 기획자 입장에서 Resume를 열람하다가 면접 제안을 하는 경우는
// InterviewProposal 함수를 실행하여 Resume 작성자에게 알립니다.


// 1) 자신의 프로젝트에 면접예약을 한 지원자가 있을 때 메일을 보낸다.
async function noteProjectOwner (projectId, resumeId, applicationId) {
    // 이메일 받는이 / 제목 / 내용을 설정한다 
    const project = await Project.findOne({ where: { projectId } })
    const resume = await Resume.findOne({ where: { resumeId } })
    const application = await Application.findOne({ where: { applicationId } })
    
    const noticeReceiver = project.email;
    const emailSubject = '[renDev] 회원님의 프로젝트에 참가하고 싶은 크루원이 있습니다.'
    const emailTemplate =  `
    축하합니다. 회원님의 프로젝트가 눈길을 끌었네요! 아래와 같이 인터뷰가 접수되었습니다.<br>
    <br>
    프로젝트 : ${project.title}<br>
    <br>
    인터뷰 일정 : ${application.schedule}<br>
    지원하신 분 : ${resume.nickname}<br>
    지원자 소개 : <a href="http://rendev.도메인/resumes/${resumeId}">http://rendev.도메인/resumes/${resumeId}</a><br> 
    지원자 연락 : <a href="mailto:${resume.email}">mailto:${resume.email}</a><br>
    <br>
    인터뷰 코드 : ${application.interviewCode}<br>
    <br>
    예약된 일시에 사이트 내의 "인터뷰 보기" 링크 또는 <a href="https://rendev.click">https://rendev.click</a>으로 접속하시어<br>
    인터뷰코드를 입력하시고 입장해주세요.<br>
    <br>
    인터뷰 시간에는 배려와 존중! 웃음이 있는 인터뷰가 되시길 기원합니다.<br>
    <br>
    좋은 팀원을 만날 거에요,<br>
    renDev 드림.<br>
    `

    // 이메일 보내기 함수를 실행한다. 인자는 1)받는이 메일주소 2)이메일 제목 3)이메일 내용
    sendNotice (noticeReceiver, emailSubject, emailTemplate)
}


// 2) 지원자가 특정 프로젝트에 예약했을 때 해당 정보를 메일로 받는다. 
async function noteApplicant (projectId, resumeId, applicationId) {
    // 이메일 받는이 / 제목 / 내용을 설정한다 
    const project = await Project.findOne({ where: { projectId } })
    const resume = await Resume.findOne({ where: { resumeId } })
    const application = await Application.findOne({ where: { applicationId } })
    
    const noticeReceiver = resume.email;
    const emailSubject = '[renDev] 프로젝트 기획자에게 인터뷰 요청을 하셨습니다.'
    const emailTemplate =  `
    축하합니다. 관심 가는 프로젝트를 찾으셨군요! 아래와 같이 인터뷰를 예약하셨습니다.<br>
    <br>
    프로젝트 : ${project.title}<br>
    <br>
    인터뷰 일정 : ${application.schedule}<br>
    프로젝트 기획자 : ${project.nickname}<br>
    프로젝트 소개 : <a href="http://rendev.도메인/projects/${projectId}">http://rendev.도메인/projects/${projectId}</a><br>
    기획자 연락 : <a href=mailto:"${project.email}">${project.email}</a><br>
    <br>
    인터뷰 코드 : ${application.interviewCode}<br>  
    <br>
    예약된 일시에 사이트 내의 "인터뷰 보기" 링크 또는 <a href="https://rendev.click">https://rendev.click</a>으로 접속하시어<br>
    인터뷰코드를 입력하시고 입장해주세요.<br>
    <br>
    인터뷰 시간에는 배려와 존중! 웃음이 있는 인터뷰가 되시길 기원합니다.<br>
    <br>
    좋은 팀원을 만날 거에요,<br>
    renDev 드림.<br>
    `

    // 이메일 보내기 함수를 실행한다. 인자는 1)받는이 메일주소 2)이메일 제목 3)이메일 내용
    sendNotice (noticeReceiver, emailSubject, emailTemplate)
}


// 3) 특정 Resume에 면접 제안을 보낼 때, 제안하는 상대방에게 이메일을 보낸다. 
async function InterviewProposal (projectId, resumeId, applicationId) {
    // 이메일 받는이 / 제목 / 내용을 설정한다 
    const project = await Project.findOne({ where: { projectId } })
    const resume = await Resume.findOne({ where: { resumeId } }) 
    
    const noticeReceiver = resume.email;
    const emailSubject = '[renDev] 프로젝트 기획자가 회원님의 참여를 요청하셨습니다.'
    const emailTemplate =  `
    축하합니다. 러브콜을 받으셨어요! 아래와 같이 프로젝트 합류 요청을 받으셨습니다.<br>
    <br>
    프로젝트 : ${project.title}<br>
    <br>
    프로젝트 기획자 : ${project.nickname}<br>
    프로젝트 소개 : <a href="http://rendev.도메인/projects/${projectId}">http://rendev.도메인/projects/${projectId}</a><br>
    기획자 연락 : <a href="mailto:${project.email}">${project.email}</a><br>
    <br>
    프로젝트 내용을 확인하시고 마음에 드신다면, <br>
    renDev에서 프로젝트 기획자와의 인터뷰 예약을 진행해주세요.<br>
    <br>
    좋은 팀원을 만날 거에요,<br>
    renDev 드림.<br>
    `

    // 이메일 보내기 함수를 실행한다. 인자는 1)받는이 메일주소 2)이메일 제목 3)이메일 내용
    sendNotice (noticeReceiver, emailSubject, emailTemplate)
}


// 이메일 보내기 함수
async function sendNotice (receiver, subject, content) {

    const transporter = nodemailer.createTransport({
        service: 'naver',
        host: 'smtp.naver.com',  // SMTP 서버명
        port: 465,  // SMTP 포트
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PASS,
        },
    });

    const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: receiver,  // 수신자 아이디
        subject: subject,
        html: content,
    };

    // 두번째 인자로 콜백 함수를 넣어주면 await x
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);
        } else {
            console.log('이메일을 성공적으로 발송했습니다', info.response);
            transporter.close()
        }
    });
}


// -------------------(시작) 이메일 발송 테스트용 template-------------------

// const project_title = 'renDev: 개발자 커뮤니티 개발 프로젝트'
// const application_schedule = new Date();
// const project_nickname = '알파플라이'
// const projectId = 789
// const project_email = 'placetobe0807@gmail.com' 
// const application_interviewCode = '494855'

// const temp_receiver='placetobe@naver.com'
// const temp_subject='[renDev] 프로젝트 기획자에게 인터뷰 요청을 하셨습니다.'
// const temp_emailTemplate =  `
//     축하합니다. 관심 가는 프로젝트를 찾으셨군요! 아래와 같이 인터뷰를 예약하셨습니다.<br>
//     <br>
//     프로젝트 : ${project_title}<br>
//     <br>
//     인터뷰 일정 : ${application_schedule}<br>
//     프로젝트 기획자 : ${project_nickname}<br>
//     프로젝트 소개 : <a href="http://rendev.도메인/projects/${projectId}">http://rendev.도메인/projects/${projectId}</a><br>
//     기획자 연락 : <a href="mailto:${project_email}">${project_email}</a><br>
//     <br>
//     인터뷰 코드 : ${application_interviewCode}<br>
//     <br>
//     예약된 일시에 사이트 내의 "인터뷰 보기" 링크 또는 <a href="https://rendev.click">https://rendev.click</a>으로 접속하시어<br>
//     인터뷰코드를 입력하시고 입장해주세요.<br>
//     <br>
//     인터뷰 시간에는 배려와 존중! 웃음이 있는 인터뷰가 되시길 기원합니다.<br>
//     <br>
//     좋은 팀원을 만날 거에요,<br>
//     renDev 드림.
//     `
// console.log(temp_emailTemplate);
// sendNotice(temp_receiver,temp_subject,temp_emailTemplate);

// -------------------( 끝 ) 이메일 발송 테스트용 template-------------------

module.exports = {
    noteProjectOwner, 
    noteApplicant, 
    InterviewProposal, 
    sendNotice
};


