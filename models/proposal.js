"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Proposal extends Model {
    static associate(models) {
      Proposal.belongsTo(models.Project, { foreignKey: "projectId" });
      Proposal.belongsTo(models.Resume, { foreignKey: "resumeId" });
    }
  }
  Proposal.init(
    {
      proposalId: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Project",
          key: "projectId",
        },
        onDelete: "CASCADE",
      },
      resumeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Resume",
          key: "resumeId",
        },
        onDelete: "CASCADE",
      },
      proposalCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: "proposal",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "proposalId" }],
        },
      ],
    }
  );
  return Proposal;
};
