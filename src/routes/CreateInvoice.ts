import {Express, Request, Response, Router} from "express";
import console from "node:console";
import DBService from "../services/database/DBService.js";
import {Invoice} from "../models/Invoice.js";
import {sendInvoice} from "../controllers/SendInvoiceController.js";
import GeneratePdfQueue from "../services/queues/GeneratePdfQueue.js";

interface InvoiceInterface {
    email: string;
    works: Work[]
}

interface Work {
    name: string;
    cost: number;
}

const setupCreateInvoiceRoute = (expressApp: Express, dbService: DBService, pdfQueue: GeneratePdfQueue): void => {
    const createInvoice: Router = Router();
    createInvoice.post("/api/invoice", async (req: Request, res: Response) => {
        console.log("Обращение к серверу...");
        try {
            const reqInvoice: InvoiceInterface = req.body;
            const invoice: Invoice = Invoice.build();
            invoice.setEmail(reqInvoice.email);
            reqInvoice.works.forEach((w: Work) => {
                invoice.addWork(w.name, w.cost);
            })
            await sendInvoice(invoice, dbService, pdfQueue);
            res.sendStatus(200)
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: error.message });
        }
    });

    expressApp.use(createInvoice);
}

export default setupCreateInvoiceRoute;