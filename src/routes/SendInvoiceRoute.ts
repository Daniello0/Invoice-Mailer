import {Express, Router} from "express";
import {sendInvoice} from "../controllers/SendInvoiceController.js";

export const setupSendInvoiceRoute = (app: Express): void => {
    const createInvoice: Router = Router();
    createInvoice.post("/api/invoice", sendInvoice);
    app.use(createInvoice);
}