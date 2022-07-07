'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      Project.hasMany(
        models.Application, {
        foreignKey: 'projectId'
      });
      Project.hasMany(
        models.ProjectSkill, {
        foreignKey: 'projectId'
      });
      Project.hasMany(
        models.ProjectPhoto, {
        foreignKey: 'projectId'
      });
      Project.belongsTo(models.User, { foreignKey : 'id' });
    }
  }
  Project.init({
    projectId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    start: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    subscript: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nickname: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'project',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "projectId" },
        ]
      },
    ]
  });
  return Project;
};
