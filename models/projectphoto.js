'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProjectPhoto extends Model {
    static associate(models) {
      ProjectPhoto.belongsTo(models.Project, { foreignKey : 'projectId' })
    }
  }
  ProjectPhoto.init({
    projectPhotoId: {
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
    photo: {
      type: DataTypes.STRING(150),
      allowNull: false,
    }
  }, {
    sequelize,
    tableName: 'project_photo',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "projectPhotoId" },
        ]
      },
    ]
  });
  return ProjectPhoto;
};