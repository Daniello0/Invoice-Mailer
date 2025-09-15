import express from "express";
import * as console from "node:console";
import DBService from "./services/DBService.js";
import { Invoice } from "./models/Invoice.js";
import process from "node:process";
import dotenv from "dotenv";
import testRoute from "./routes/TestRoute.js";
import setupSwagger from "./routes/Swagger.js";
import createUser from "./routes/CreateUser.js";
import setupSendInvoiceRoute from "./controllers/SendInvoiceController.js";

dotenv.config();
const app = express();
const dbService = new DBService();
await dbService.init();

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
app.use(testRoute);


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
app.post("/api/invoice", async (req, res) => {
  console.log("Обращение к серверу...");
  try {
    const reqInvoice: Invoice = req.body;
    await setupSendInvoiceRoute(reqInvoice, dbService)
    res.sendStatus(200)
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message });
  }
});

app.use(createUser);

app.listen(process.env.APP_PORT, async () => {
  console.log("Сервер запущен на http://localhost:" + process.env.APP_PORT);
});
