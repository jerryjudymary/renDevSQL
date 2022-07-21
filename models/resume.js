"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Resume extends Model {
    static associate(models) {
      Resume.hasMany(models.Application, {
        foreignKey: "resumeId",
      });
      Resume.hasMany(models.Proposal, {
        foreignKey: "resumeId",
      });
      Resume.hasMany(models.ResumeSkill, {
        foreignKey: "resumeId",
        sourceKey: "resumeId",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Resume.belongsTo(models.User, {
        foreignKey: "id",
      });
    }
  }
  Resume.init(
    {
      resumeId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      resumeImage: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      start: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      end: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      content2: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content3: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "resume",
      timestamps: true,
      createdAt: true,
      updatedAt: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "resumeId" }],
        },
      ],
    }
  );
  return Resume;
};
