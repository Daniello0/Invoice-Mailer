"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.addConstraint("invoice_works", {
      fields: ["invoice_log_id"],
      type: "foreign key",
      name: "fk_invoiceworks_invoice",
      references: {
        table: "invoice_logs",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint(
      "invoice_works",
      "fk_invoiceworks_invoice",
    );
  },
};
