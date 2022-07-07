'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {
      Application.belongsTo(models.User, { foreignKey : 'id' }),
      Application.belongsTo(models.Project, { foreignKey : 'projectId' });
      Application.belongsTo(models.Resume, { foreignKey : 'resumeId' });
    }
  }
  Application.init({
    applicationId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Project',
        key: 'projectId'
      },
      onDelete: 'CASCADE'
    },
    resumeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Resume',
        key: 'resumeId'
      }
    },
    id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'User',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    schedule: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    interviewCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
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