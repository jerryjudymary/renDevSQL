<br>

# **항해 99 7기 B반 | 실전 프로젝트 renDev [ 랑데브 ] BE**
<br>

<div align="center">
  <a href="https://rendev99.com"><img src="https://user-images.githubusercontent.com/105159616/182056864-cbafa3e2-4594-40ee-acd0-45514b538a34.png"/><br>이미지를 클릭하시면 renDev 서비스로 이동합니다.</a>
</div>
<br>
<hr>

## **목차 | Contents**

1. [renDev 서비스 소개](#-renDev-서비스-소개)
2. [팀 구성](#-팀-구성)
3. [Features](#-Features)
4. [기술 스택과 라이브러리](#-기술-스택과-라이브러리)
5. [Architecture](#-Architecture)
6. [ERD](#-ERD)
7. [Trouble Shooting](#-Trouble-Shooting)

<hr>
<br>

## **🌌 renDev 서비스 소개**

#### [renDev] 사람과 아이디어의 조우

<br>

🚀 renDev 서비스 바로가기 <br> [https://rendev99.com] <br>
* renDev는 "포트폴리오를 준비하는 개발자 및 디자이너를 위한 협업 프로젝트 매칭 서비스" 입니다. 
* 프로젝트 아이디어는 있는데 혼자서 하기엔 버거울 때,
팀 프로젝트에 참여할 의욕은 있지만 아이디어가 마땅치 않을 때.
renDev에서 마음에 맞는 프로젝트와 팀원을 만나 보세요 🙂

<br>

💡 renDev 서비스 이용 안내 <br> [https://bubble-dove-10c.notion.site/renDev-Tutorial-6298fdef96504da28773d47db3bef8cf]
* 서비스 이용 방법에 대한 간단한 가이드를 작성해 두었습니다.

<br>

📄 renDev 브로셔 페이지 <br> [https://www.notion.so/renDev-b4158b77a39343feab8a22ef0fa3e30c] <br>

* renDev는 웹개발자 교육 부트캠프 "항해99"의 최종 과정인 <실전 프로젝트>의 결과물입니다. 저희는 7기 B반 2조입니다 :)
* **위 브로셔 페이지 링크에서 상세한 서비스 설명 및 팀원 정보를 확인하실 수 있습니다.** 

<br> 

## 🌒 프로젝트 기간

- 2022년 06월 24일 ~ 2022년 08월 05일

<br>

## **👨‍🚀👩‍🚀 팀 구성**

#### 


<table>
  <tr>
  <td colspan='1' align="center">
  Backend
  </td>
  <td colspan='1' align="center">
  Frontend
  </td>
  <td colspan='1' align="center">
  Designer
  </td>
  <tr>
    <td align="center" >
    <b>우재영</b></a><br>
    <a href="https://github.com/alpha-fly">Github</a>
    <br><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/><br>
    </td>
    <td align="center">
    <b>이천희</b></a><br />
    <a href="https://github.com/FrostALee" >Github</a>
    <br><img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=React&logoColor=white"/><br>
    </td>
    <td align="center">
    <b>김나정</b></a><br />
    </td>
    <tr>
    <td align="center">
    <b>김주혁</b></a><br /> 
    <a href="https://github.com/playhuck">Github</a>
    <br><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/><br>
    </td>
    <td align="center">
    <b>유승연</b></a><br /> 
    <a href="https://github.com/qoqomi">Github</a>
    <br><img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=React&logoColor=white"/><br>
    </td>
    <td align="center">
    </td>
    </tr>
    <tr>
    <td align="center">
    <b>유승재</b></a><br /> 
    <a href="https://github.com/jerryjudymary">Github</a>
    <br><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/><br>
    </td>
    <td align="center">
    </td>
    <td align="center">
    </td>
    </tr>
    <tr>
    <td align="center">
    <b>윤형진</b></a><br /> 
    <a href="https://github.com/engin9803">Github</a>
    <br><img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=Node.js&logoColor=white"/><br>
    </td>
    <td align="center">
    </td>
    <td align="center">
    </td>
    </tr>
</table>


<br>

## **🛰️ Features**

#### ✅ 인터뷰 기능 (영상통화 + 텍스트 채팅)

- 협업 프로젝트를 함께할 팀원을 결정하기 전, 서로에 대해 알아보는 시간을 가질 수 있도록 WebRTC 기반 영상통화를 동반한 인터뷰 기능을 제공합니다.

1) 사용자는 특정 프로젝트 게시글을 보고 해당 프로젝트에 대한 참여 인터뷰를 신청하거나,
2) 특정 유저의 소개글을 보고 자신의 프로젝트에 인터뷰를 신청하도록 초대할 수 있으며, 
3) 인터뷰 예약이 이루어졌을 때 난수로 생성된 인터뷰코드를 발급받아 채팅방에 입장할 수 있습니다.

#### ✅  **스케줄 예약, 제안 기능**

- 프로젝트 모집 유저와 프로젝트 참가 희망 유저간의 화상채팅 일정 예약이 가능합니다.
- 마이페이지에서 실시간으로 상호 간의 예약 현황 확인이 가능합니다.
- 프로젝트 작성자는 예약 현황에서 지원자에 대한 면접 완료, 합격, 불합격 등 상태를 업데이트할 수 있습니다.
- 프로젝트 작성자는 면접 제안을 보내고 싶은 지원자에 자신의 프로젝트 정보를 선택하여 제안 메일을 전송할 수 있습니다.

#### ✅ 검색 기능

- “프로젝트 찾기”와 “팀원 찾기” 페이지에 검색 기능을 제공합니다.
- <찾는 직군>, <요구하는 (또는 보유한) 기술 스택>, <프로젝트 진행 가능 기간>
- 위의 3가지 요소에 대한 다중조건 검색이 가능합니다.

#### ✅ 매칭 기능

- 미리 작성한 게시글에 포함된 조건을 바탕으로 딱 맞는 프로젝트 or 팀원을 찾아주는 기능입니다.
- 작성한 프로젝트의 조건에 맞는 팀원을 찾아 드립니다.
- 작성한 자기소개서의 조건에 맞는 프로젝트를 찾을 수 있습니다.

<br>

## **📡 기술 스택과 라이브러리**

### [[도입 이유](https://www.notion.so/renDev-BE-53c4bd215e9441c7929211491db35483)]

#### 🔧 기술 스택

기술스택 | 설명
---|:---:
Node.js | 자바스크립트 런타임
Express | 웹 프레임워크
MySQL (RDS) | RDBMS 클라우드 인스턴스
Redis (Azure) | 인메모리 저장소(완전관리형)
Github Action - AWS CodeDeploy | CI/CD 툴
Nginx | Proxy 서버
WebRTC - socket.io | 영상통화, 실시간 채팅 구현
coturn | 자체 TURN 서버 구축


#### 📚 라이브러리

라이브러리 | 설명
---|:---:
<img src='https://img.shields.io/badge/artillery-1.7.9-lightgrey'> | 서버 스트레스 테스트
<img src='https://img.shields.io/badge/bcrypt-5.0.1-lightgrey'> | 유저 비밀번호 암호화
<img src='https://img.shields.io/badge/cors-2.8.5-lightgrey'> | 리소스 공유 CORS 정책 설정
<img src='https://img.shields.io/badge/dotenv-16.0.1-lightgrey'>  | 환경변수 관리
<img src='https://img.shields.io/badge/cross--env-7.0.3-lightgrey'>  | 스크립트 실행 환경변수 설정
<img src='https://img.shields.io/badge/express-4.18.1-lightgrey'> | 서버 프레임워크
<img src='https://img.shields.io/badge/helmet-5.1.0-lightgrey'>  | 서버 보안 취약점 방어
<img src='https://img.shields.io/badge/redis-3.1.2-lightgrey'>  | Redis Cli
<img src='https://img.shields.io/badge/redis--delete--pattern-0.1.0-lightgrey'>  | Redis 키 패턴 삭제
<img src='https://img.shields.io/badge/nodemailer-6.7.7-lightgrey'>  | 유저에게 메일 전송
<img src='https://img.shields.io/badge/multer--s3-2.10.0-lightgrey'>  | S3 버킷 이미지 업로드
<img src='https://img.shields.io/badge/joi-17.4.1-lightgrey'>  | 유효성 검사
<img src='https://img.shields.io/badge/jest-28.1.3-lightgrey'>  | 테스트 코드
<img src='https://img.shields.io/badge/jsonwebtoken-8.5.1-lightgrey'>  | 토큰 암호화
<img src='https://img.shields.io/badge/cookie--parser-1.4.6-lightgrey'>  | 서버 - 클라이언트 간 쿠키 파싱
<img src='https://img.shields.io/badge/moment-2.29.1-lightgrey'> | Datetime 자료형 관리
<img src='https://img.shields.io/badge/morgan-1.10.0-lightgrey'> | HTTP 로그 기록
<img src='https://img.shields.io/badge/uuid-8.3.2-lightgrey'> | UUID 생성
<img src='https://img.shields.io/badge/winston-3.8.1-lightgrey'> | 로그 파일 생성
<img src='https://img.shields.io/badge/winston--daily--rotate--file-4.7.1-lightgrey'> | 로그 파일 관리
<img src='https://img.shields.io/badge/mysql-2.18.1-lightgrey'> | MySQL 연동
<img src='https://img.shields.io/badge/sequelize-6.21.2-lightgrey'>  | MySQL ORM
<img src='https://img.shields.io/badge/sequelize--cli-6.4.1-lightgrey'> | MySQL ORM 콘솔


<br>

## **🏗 Architecture**
![KakaoTalk_20220731_212444855](https://user-images.githubusercontent.com/105159616/182056813-506e7689-094c-4f3c-806b-2b3124b63ec5.png)
#### 

<br>

## **🔀 ERD**
![ERD_FINAL_RENDEV](https://user-images.githubusercontent.com/105159616/182063012-359a16b8-434f-40ae-8a99-1148723ec75a.png)
####

<br>

## **🌠 Trouble Shooting**

✅ 자체 TURN 서버 구축


✅ 비즈니스 로직, 쿼리 수정으로 API 연산 복잡도, 코드 가독성 개선


✅ 부하 테스트시 병목 개선을 위한 Redis 캐싱 도입


#### 아래 링크를 클릭하시면 renDev BE팀의 상세한 트러블 슈팅 기록을 보실 수 있습니다 :)

#### [[트러블 슈팅 기록 보러가기](https://www.notion.so/renDev-Trouble-Shooting-BE-d0878fe1cc57469d9f160f92eca6b7fe)]



<br>

### 🎁 좋은 팀원을 만나게 되실 거에요, renDev 드림.
