"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn("voters", "ElectionId", {
      type: Sequelize.DataTypes.INTEGER,
    });

    await queryInterface.addConstraint("voters", {
      fields: ["ElectionId"],
      type: "foreign key",
      references: {
        table: "elections",
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
    await queryInterface.removeColumn("questions", "ElectionId");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
