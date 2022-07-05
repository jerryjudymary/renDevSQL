'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User),
      Application.belongsTo(models.Project);
    }
  }
  Application.init({
    scheduleId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    schedule: {
      type: DataTypes.DATE,
      allowNull: false
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(8),
      allowNull: false
    },
    interviewCode: {
      type: DataTypes.STRING(6),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'application',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "applicationId" },
        ]
      },
    ]
  });
  return Application;
};