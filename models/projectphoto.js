'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProjectPhoto extends Model {
    static associate(models) {
      ProjectPhoto.belongsTo(models.Project)
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