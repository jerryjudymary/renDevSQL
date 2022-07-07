'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProjectSkill extends Model {
    static associate(models) {
      ProjectSkill.belongsTo(models.Project, { foreignKey : 'projectId' })
    }
  }
  ProjectSkill.init({
    projectSkillId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Project',
        key: 'projectId'
      },
      onDelete: 'CASCADE'
    },
    skill: {
      type: DataTypes.STRING(20),
      allowNull: false,
    }
  }, {
    sequelize,
    tableName: 'project_skill',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "projectSkillId" },
        ]
      },
    ]
  });
  return ProjectSkill;
};