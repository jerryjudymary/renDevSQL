"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class resumes extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  resumes.init(
    {
      userId: DataTypes.STRING,
      content: DataTypes.STRING,
      content2: DataTypes.STRING,
      content3: DataTypes.STRING,
      start: DataTypes.DATE,
      end: DataTypes.DATE,
      skills: DataTypes.STRING,
      role: DataTypes.STRING,
      resumeImage: DataTypes.STRING,
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      name: DataTypes.STRING,
      createAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "resumes",
    }
  );
  return resumes;
};
