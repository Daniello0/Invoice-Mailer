"use strict";

const DataTypes = require("sequelize");

module.exports = {
  async up(queryInterface) {
    await queryInterface.createTable("invoice_works", {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      invoice_log_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: "invoice_logs",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cost: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("invoice_works");
  },
};
