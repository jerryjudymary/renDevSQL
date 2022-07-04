"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("resumes", {
      resumeid: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nickname: {
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.STRING,
      },
      phone: {
        type: Sequelize.STRING,
      },
      resumeImage: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.STRING,
      },
      start: {
        type: Sequelize.DATE,
      },
      end: {
        type: Sequelize.DATE,
      },
      role: {
        type: Sequelize.STRING,
      },
      skills: {
        type: Sequelize.STRING,
      },
      content2: {
        type: Sequelize.STRING,
      },
      content3: {
        type: Sequelize.STRING,
      },
      createAt: {
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("resumes");
  },
};
