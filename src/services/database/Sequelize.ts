import process from "node:process";
import { Sequelize } from "sequelize-typescript";
import { Client } from "../../models/Client.js";
import { Invoice } from "../../models/Invoice.js";
import console from "node:console";
import { InvoiceWork } from "../../models/InvoiceWorks.js";

const POSTGRES_DB: string = process.env.POSTGRES_DB;
const POSTGRES_USER: string = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD: string = process.env.POSTGRES_PASSWORD;
const POSTGRES_PORT: number = parseInt(process.env.POSTGRES_PORT);

const sequelize = new Sequelize({
  database: POSTGRES_DB,
  username: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  port: POSTGRES_PORT,
  models: [Client, Invoice, InvoiceWork],
  dialectOptions: {},
  logging: false,
  define: {
    timestamps: false,
  },
  dialect: "postgres",
  host: "db",
});

export const initSequelize = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error("Не удалось подключиться к БД: ", error);
    throw error;
  }
};
