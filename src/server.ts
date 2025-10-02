import express from "express";
import * as console from "node:console";
import process from "node:process";
import dotenv from "dotenv";
import setupSwagger from "./Swagger.js";
import {setupCreateUserRoute} from "./routes/CreateUserRoute.js";
import {redisConnection} from "./services/redis/RedisConnection.js";
import {initSequelize} from "./services/database/Sequelize.js";
import {initMailQueue} from "./services/queues/MailQueue.js";
import {initPdfQueue} from "./services/queues/PdfQueue.js";
import {setupSendInvoiceRoute} from "./routes/SendInvoiceRoute.js";
import {setupHealthRoute} from "./routes/HealthRoute.js";

dotenv.config();
const app = express();

setupSwagger(app);

(async () => {
  await initSequelize();
})();

initMailQueue('mail-sender', redisConnection);
initPdfQueue('pdf-generator', redisConnection);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * @swagger
 * /test:
 *   get:
 *     tags:
 *       - Test
 *     summary: Послать тестовый запрос
 *     responses:
 *       '200':
 *         description: Запрос успешно принят
 */
setupHealthRoute(app);


/**
 * @swagger
 * /api/invoice:
 *   post:
 *     tags:
 *       - Invoices
 *     summary: Создать и поставить в очередь задачу на генерацию счета
 *     description: Принимает email клиента и список выполненных работ.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceRequest'
 *
 *     responses:
 *       '200':
 *         description: Успешно. Задача отправлена в очередь.
 *
 *       '500':
 *         description: |
 *           Произошла ошибка.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
setupSendInvoiceRoute(app);

setupCreateUserRoute(app);

app.listen(process.env.APP_PORT, async () => {
  console.log("Сервер запущен на http://localhost:" + process.env.APP_PORT);
});
