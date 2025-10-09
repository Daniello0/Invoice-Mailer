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

/*
TODO: Не отправляет инвойс через swagger.
 */