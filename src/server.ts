import express from "express";
import * as console from "node:console";
import process from "node:process";
import dotenv from "dotenv";
import health from "./routes/Health.js";
import setupSwagger from "./Swagger.js";
import createUser from "./routes/CreateUser.js";
import setupCreateInvoiceRoute from "./routes/CreateInvoice.js";
import {redisConnection} from "./services/redis/RedisConnection.js";
import {initSequelize} from "./services/database/Sequelize.js";
import {initMailQueue} from "./services/queues/MailQueue.js";
import {initPdfQueue} from "./services/queues/PdfQueue.js";

dotenv.config();
const app = express();

(async () => {
  await initSequelize();
})();

initMailQueue('mail-sender', redisConnection);
initPdfQueue('pdf-generator', redisConnection);

setupSwagger(app);

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
app.use(health);


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
setupCreateInvoiceRoute(app);

app.use(createUser);

app.listen(process.env.APP_PORT, async () => {
  console.log("Сервер запущен на http://localhost:" + process.env.APP_PORT);
});
