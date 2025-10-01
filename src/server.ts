import express from "express";
import * as console from "node:console";
import DBService from "./services/database/DBService.js";
import process from "node:process";
import dotenv from "dotenv";
import health from "./routes/Health.js";
import setupSwagger from "./routes/Swagger.js";
import createUser from "./routes/CreateUser.js";
import setupCreateInvoiceRoute from "./routes/CreateInvoice.js";

dotenv.config();
const app = express();

const dbService = new DBService();
(async () => {
  await dbService.init();
})();

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
setupCreateInvoiceRoute(app, dbService);

app.use(createUser);

app.listen(process.env.APP_PORT, async () => {
  console.log("Сервер запущен на http://localhost:" + process.env.APP_PORT);
});
