"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Project, {
        foreignKey: "id",
      }),
        User.hasMany(models.Resume, {
          foreignKey: "id",
        }),
        User.hasMany(models.Application, {
          foreignKey: "id",
        });
    }
  }
  User.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      passwordCheck: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      birth: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      policy: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      profileImage: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      refreshToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "user",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "id" }],
        },
      ],
    }
  );
  return User;
};
