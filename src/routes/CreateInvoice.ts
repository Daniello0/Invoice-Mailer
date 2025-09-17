import {Express, Request, Response, Router} from "express";
import console from "node:console";
import {Invoice} from "../models/Invoice.js";
import sendInvoiceController from "../controllers/SendInvoiceController.js";
import DBService from "../services/DBService.js";

const setupCreateInvoiceRoute = (expressApp: Express, dbService: DBService): void => {
    const createInvoice: Router = Router();
    createInvoice.post("/api/invoice", async (req: Request, res: Response) => {
        console.log("Обращение к серверу...");
        try {
            const reqInvoice: Invoice = req.body;
            await sendInvoiceController(reqInvoice, dbService)
            res.sendStatus(200)
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    });

    expressApp.use(createInvoice);
}

export default setupCreateInvoiceRoute;