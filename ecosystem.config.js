module.exports = {
  apps: [
    {
      name: "nodejs-sequelize-pm2", // pm2 name
      script: "./app.js", // // 앱 실행 스크립트
      instances: 0, // 0 일경우 CPU 코어 수 만큼 프로세스를 생성 클러스터 모드 사용 시 생성할 인스턴스 수
      exec_mode: "cluster", // fork, cluster 모드 중 선택
      merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
      autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
      watch: false,
      // watch: ["middlewares", "API"], //지정한 폴더를 감시해서 변경사항 실행
      // ignore_watch: ["node_modules"], // 반대로 해당폴더의 파일변경은 무시
      // max_memory_restart: "512M", // 프로그램의 메모리 크기가 일정 크기 이상이 되면 재시작한다.
      // env: {
      //     // 개발 환경설정
      //     NODE_ENV: 'development',
      // },
      env_production: {
        // 운영 환경설정 (--env production 옵션으로 지정할 수 있다.)
        NODE_ENV: "production",
      },
      // // 로그 출력 경로를 설정
      // output: "~/logs/pm2/console.log",
      // // 에러 로그 출력 경로를 설정
      // error: "~/logs/pm2/onsoleError.log",
    },
  ],
};
