import console from "node:console";
import { Invoice } from "../models/Invoice.js";
import { Client } from "../models/Client.js";
import {
  emailExistsInDB,
  getClient,
} from "../services/database/ClientService.js";
import {
  addInvoiceToLogs,
  getInvoiceFromLogs,
} from "../services/database/LogsService.js";
import { Request, Response } from "express";
import { addPdfJob } from "../services/queues/PdfQueue.js";
import { validateInvoice } from "../models/Invoice.js";

export interface InvoiceInterface {
  email: string;
  works: Work[];
}

export interface Work {
  name: string;
  cost: number;
}

export const sendInvoice = async (req: Request, res: Response) => {
  console.log("Обращение к серверу...");
  try {
    const reqInvoice: InvoiceInterface = req.body;
    validate(reqInvoice);

    await addLogToDB(reqInvoice);

    console.log("Получение клинтов");
    const client: Client = await getClient(reqInvoice.email);
    const invoiceFromDb: Invoice = await getInvoiceFromLogs(reqInvoice.email);

    await addInvoiceToQueue(client, invoiceFromDb);

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
};

function validate(invoice: InvoiceInterface) {
  const validatorResult = validateInvoice(invoice);
  if (!validatorResult.success) {
    throw new Error(validatorResult.errMsg);
  }
}

async function addLogToDB(invoice: InvoiceInterface) {
  console.log("Начало проверки и добавления инвойса в лог");
  if (await emailExistsInDB(invoice.email)) {
    await addInvoiceToLogs(invoice);
  } else {
    throw new Error(`Ошибка! Почта ${invoice.email} не найдена`);
  }
}

async function addInvoiceToQueue(client: Client, invoice: Invoice) {
  console.log("Начало добавления данных в очередь");

  await addPdfJob({
    client: client,
    invoice: invoice,
  });
  console.log("Данные добавлены в очередь.");
}
