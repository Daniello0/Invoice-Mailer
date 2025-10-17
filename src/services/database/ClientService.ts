import { Client } from "../../models/Client.js";
import console from "node:console";

export const getClient = async (email: string): Promise<Client> => {
  email = email.trim();
  try {
    return await Client.findOne({
      where: { email },
    });
  } catch (error) {
    console.error(`Ошибка при получении клиента с email ${email}:`, error);
    throw error;
  }
};

export const emailExistsInDB = async (email: string): Promise<boolean> => {
  email = email.trim();
  const client: Client = await Client.findOne({
    where: { email },
  });
  return client !== null;
};
