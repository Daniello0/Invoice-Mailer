import {Express, Request, Response, Router} from "express";
import console from "node:console";
import sendInvoiceController from "../controllers/SendInvoiceController.js";
import DBService from "../services/database/DBService.js";
import {Invoice} from "../models/Invoice.js";

interface InvoiceInterface {
    email: string;
    works: Work[]
}

interface Work {
    work: string;
    cost: number;
}

const setupCreateInvoiceRoute = (expressApp: Express, dbService: DBService): void => {
    const createInvoice: Router = Router();
    createInvoice.post("/api/invoice", async (req: Request, res: Response) => {
        console.log("Обращение к серверу...");
        try {
            const reqInvoice: InvoiceInterface = req.body;
            const invoice: Invoice = Invoice.build();
            invoice.setEmail(reqInvoice.email);
            reqInvoice.works.forEach((w: Work) => {
                invoice.addWork(w.work, w.cost);
            })
            await sendInvoiceController(invoice, dbService)
            res.sendStatus(200)
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    });

    expressApp.use(createInvoice);
}

export default setupCreateInvoiceRoute;