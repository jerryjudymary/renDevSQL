"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ResumeSkill extends Model {
    static associate(models) {
      ResumeSkill.belongsTo(models.Resume, {
        foreignKey: "resumeId",
        targetKey: "resumeId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }
  ResumeSkill.init(
    {
      resumeSkillId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      resumeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      skill: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "resume_skill",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "resumeSkillId" }],
        },
      ],
    }
  );
  return ResumeSkill;
};
