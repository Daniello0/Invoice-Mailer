import console from "node:console";
import {Invoice} from "../models/Invoice.js";
import {Client} from "../models/Client.js";
import QueueController from "../services/queues/QueueController.js";
import DBService from "../services/database/DBService.js";
import {redisConnection} from "../services/redis/RedisConnection.js";

/*
TODO: сделать функцию меньше (разбить на части)
 */

export default class SendInvoiceController {
    static sendInvoice = async (reqInvoice: Invoice, dbService: DBService) => {

        const validateInvoice = Invoice.validateInvoice(reqInvoice);
        if (!validateInvoice.success) {
            throw new Error(validateInvoice.errMsg);
        }

        // 1: добавить лог в БД
        console.log("Начало проверки и добавления инвойса в лог");
        if (await dbService.emailExistsInDB(reqInvoice.email)) {
            await dbService.addInvoiceToLogs(reqInvoice);
        } else {
            throw new Error(`Ошибка! Почта ${reqInvoice.email} не найдена`)
        }

        // 2: взять данные из логов
        console.log("Получение клинтов");
        const client: Client = await dbService.getClient(reqInvoice.email);
        const invoice: Invoice = await dbService.getInvoiceFromLogs(
            reqInvoice.email,
        );

        console.log(client, invoice);

        // 3: добавить данные в очередь и обработать
        console.log("Начало добавления данных в очередь");
        const queueController = new QueueController(
            "pdf-generator",
            redisConnection,
        );
        await queueController.addDataToQueue({ client: client, invoice: invoice });
    }
}

