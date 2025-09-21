import {Sequelize} from "sequelize-typescript";
import * as console from "node:console";
import {Invoice} from "../../models/Invoice.js";
import process from "node:process";
import {Client} from "../../models/Client.js";

export default class DBService {
  sequelize: Sequelize | undefined;

  constructor(params?: { sequelize: Sequelize }) {
    this.sequelize = params?.sequelize;
  }

  init = async () => {
    const POSTGRES_DB: string = process.env.POSTGRES_DB;
    const POSTGRES_USER: string = process.env.POSTGRES_USER;
    const POSTGRES_PASSWORD: string = process.env.POSTGRES_PASSWORD;
    const POSTGRES_PORT: number = parseInt(process.env.POSTGRES_PORT);

    console.log(POSTGRES_DB);

    if (!POSTGRES_DB || !POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_PORT) {
      throw new Error("database (name, user, pass, port) не прописаны в конфигурации.");
    }

    try {
      const sequelize = new Sequelize({
          database: POSTGRES_DB,
          username: POSTGRES_USER,
          password: POSTGRES_PASSWORD,
          port: POSTGRES_PORT,
          models: [Client, Invoice],
          dialectOptions: {},
          logging: false,
          define: {
              timestamps: false,
          },
          dialect: 'postgres',
          host: 'db',
      });
      await sequelize.authenticate();
      this.sequelize = sequelize;
      console.log("Соединение с БД выполнено.");
    } catch (error) {
      console.error("Не удалось подключиться к БД: ", error);
      throw error;
    }
  };

    getClient = async (email: string): Promise<Client> => {
        email = email.trim();
        try {
            return await Client.findOne({
                where: {email},
            });
        } catch (error) {
            console.error(`Ошибка при получении клиента с email ${email}:`, error);
            throw error;
        }
    }

    emailExistsInDB = async (email: string): Promise<boolean> => {
        email = email.trim();
        const client: Client = await Client.findOne({
            where: { email },
        });
        return client !== null;
    };

    addInvoiceToLogs = async (invoice: Invoice): Promise<void> => {
        try {
            await Invoice.upsert({
                email: invoice.email,
                works: invoice.works,
            });
        } catch (error) {
            throw error;
        }
    };

  getInvoiceFromLogs = async (email: string): Promise<Invoice> => {
    email = email.trim();
    try {
        return await Invoice.findOne({
            where: {email},
        });
    } catch (error) {
      console.error(`Ошибка при получении логов для email ${email}:`, error);
      throw error;
    }
  }
}
