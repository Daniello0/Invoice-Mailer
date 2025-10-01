import console from "node:console";
import {Invoice} from "../models/Invoice.js";
import {Client} from "../models/Client.js";
import DBService from "../services/database/DBService.js";
import {redisConnection} from "../services/redis/RedisConnection.js";
import GeneratePdfQueue from "../services/queues/GeneratePdfQueue.js";
import SendMailQueue from "../services/queues/SendMailQueue.js";

export const sendInvoice = async (reqInvoice: Invoice, dbService: DBService) => {
    validate(reqInvoice);

    await addLogToDB(dbService, reqInvoice);

    console.log("Получение клинтов");
    const client: Client = await dbService.getClient(reqInvoice.email);
    const invoice: Invoice = await dbService.getInvoiceFromLogs(
        reqInvoice.email,
    );

    await addInvoiceToQueue(client, invoice);
}

function validate(invoice: Invoice) {
    const validateInvoice = Invoice.validateInvoice(invoice);
    if (!validateInvoice.success) {
        throw new Error(validateInvoice.errMsg);
    }
}

async function addLogToDB(dbService: DBService, invoice: Invoice) {
    console.log("Начало проверки и добавления инвойса в лог");
    if (await dbService.emailExistsInDB(invoice.email)) {
        await dbService.addInvoiceToLogs(invoice);
    } else {
        throw new Error(`Ошибка! Почта ${invoice.email} не найдена`)
    }
}

async function addInvoiceToQueue(client: Client, invoice: Invoice) {
    console.log("Начало добавления данных в очередь");
    const sendMailQueue: SendMailQueue = new SendMailQueue("mail-sender", redisConnection);
    const generatePdfQueue: GeneratePdfQueue = new GeneratePdfQueue(
        "pdf-generator", redisConnection, sendMailQueue
    );
    await generatePdfQueue.addDataToQueue({
        client: client,
        invoice: invoice,
    });
    console.log("Данные добавлены в очередь.");
}
