"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("options", "QuestionId", {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstraint("options", {
      fields: ["QuestionId"],
      type: "foreign key",
      references: {
        table: "questions",
        field: "id",
      },
      onDelete: "cascade",
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("options", "QuestionId");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
