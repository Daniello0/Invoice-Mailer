import console from "node:console";
import {Invoice} from "../models/Invoice.js";
import {Client} from "../models/Client.js";
import DBService from "../services/database/DBService.js";
import GeneratePdfQueue from "../services/queues/GeneratePdfQueue.js";

export const sendInvoice = async (reqInvoice: Invoice, dbService: DBService, pdfQueue: GeneratePdfQueue) => {
    validate(reqInvoice);

    await addLogToDB(dbService, reqInvoice);

    console.log("Получение клинтов");
    const client: Client = await dbService.getClient(reqInvoice.email);
    const invoice: Invoice = await dbService.getInvoiceFromLogs(
        reqInvoice.email,
    );

    await addInvoiceToQueue(client, invoice, pdfQueue);
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

async function addInvoiceToQueue(client: Client, invoice: Invoice, pdfQueue: GeneratePdfQueue) {
    console.log("Начало добавления данных в очередь");
    await pdfQueue.addDataToQueue({
        client: client,
        invoice: invoice,
    });
    console.log("Данные добавлены в очередь.");
}
