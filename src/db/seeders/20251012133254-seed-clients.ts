"use strict";

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      INSERT INTO clients (first_name, last_name, company_name, email, created_at)
      VALUES ('Даниил', 'Киселевский', 'Daniil Inc', 'daniilreservemail@gmail.com', 'NOW()')
      ON CONFLICT (email) DO NOTHING;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete("clients", {
      email: "daniilreservemail@gmail.com",
    });
  },
};
