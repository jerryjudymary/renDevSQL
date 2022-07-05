var DataTypes = require("sequelize").DataTypes;
var _project = require("./project");

function initModels(sequelize) {
  var Project = _project(sequelize, DataTypes);

  return {
    Project
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
