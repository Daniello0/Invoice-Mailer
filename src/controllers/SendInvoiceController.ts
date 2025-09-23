import console from "node:console";
import {Invoice} from "../models/Invoice.js";
import {Client} from "../models/Client.js";
import DBService from "../services/database/DBService.js";
import {redisConnection} from "../services/redis/RedisConnection.js";
import GeneratePdfQueue from "../services/queues/GeneratePdfQueue.js";
import SendMailQueue from "../services/queues/SendMailQueue.js";

export default class SendInvoiceController {
    static sendInvoice = async (reqInvoice: Invoice, dbService: DBService) => {

        // валидация
        this.validate(reqInvoice);

        // 1: добавить лог в БД
        await this.addLogToDB(dbService, reqInvoice);

        // 2: взять данные из логов
        console.log("Получение клинтов");
        const client: Client = await dbService.getClient(reqInvoice.email);
        const invoice: Invoice = await dbService.getInvoiceFromLogs(
            reqInvoice.email,
        );

        // 3: добавить данные в очередь и обработать
        await this.addInvoiceToQueue(client, invoice);
    }

    private static validate(invoice: Invoice) {
        const validateInvoice = Invoice.validateInvoice(invoice);
        if (!validateInvoice.success) {
            throw new Error(validateInvoice.errMsg);
        }
    }

    private static async addLogToDB(dbService: DBService, invoice: Invoice) {
        console.log("Начало проверки и добавления инвойса в лог");
        if (await dbService.emailExistsInDB(invoice.email)) {
            await dbService.addInvoiceToLogs(invoice);
        } else {
            throw new Error(`Ошибка! Почта ${invoice.email} не найдена`)
        }
    }

    private static async addInvoiceToQueue(client: Client, invoice: Invoice) {
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
}

