import console from "node:console";
import {Invoice} from "../models/Invoice.js";
import {Client} from "../models/Client.js";
import {emailExistsInDB, getClient} from "../services/database/ClientService.js";
import {addInvoiceToLogs, getInvoiceFromLogs} from "../services/database/LogsService.js";
import {Request, Response} from "express";
import {addPdfJob} from "../services/queues/PdfQueue.js";

interface InvoiceInterface {
    email: string;
    works: Work[]
}

interface Work {
    name: string;
    cost: number;
}

export const sendInvoice = async (req: Request, res: Response) => {
    console.log("Обращение к серверу...");
    try {
        const reqInvoice: InvoiceInterface = req.body;
        const invoice: Invoice = Invoice.build();
        invoice.setEmail(reqInvoice.email);
        reqInvoice.works.forEach((w: Work) => {
            invoice.addWork(w.name, w.cost);
        })
        validate(invoice);

        await addLogToDB(invoice);

        console.log("Получение клинтов");
        const client: Client = await getClient(reqInvoice.email);
        const invoiceFromDb: Invoice = await getInvoiceFromLogs(
            reqInvoice.email,
        );

        await addInvoiceToQueue(client, invoiceFromDb);

        res.sendStatus(200)
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
}

function validate(invoice: Invoice) {
    const validateInvoice = Invoice.validateInvoice(invoice);
    if (!validateInvoice.success) {
        throw new Error(validateInvoice.errMsg);
    }
}

async function addLogToDB(invoice: Invoice) {
    console.log("Начало проверки и добавления инвойса в лог");
    if (await emailExistsInDB(invoice.email)) {
        await addInvoiceToLogs(invoice);
    } else {
        throw new Error(`Ошибка! Почта ${invoice.email} не найдена`)
    }
}

async function addInvoiceToQueue(client: Client, invoice: Invoice) {
    console.log("Начало добавления данных в очередь");

    await addPdfJob({
        client: client,
        invoice: invoice,
    })
    console.log("Данные добавлены в очередь.");
}
