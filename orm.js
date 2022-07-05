const SequelizeAuto = require('sequelize-auto');
const auto = new SequelizeAuto("rendev", "root", "judymary", {
      host: "3.34.200.72",
      port: "3306",
      dialect: "mysql",
      //noAlias: true // as 별칭 미설정 여부
   }
);
auto.run((err)=>{
   if(err) throw err;
})