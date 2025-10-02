import {Express, Router} from "express";
import {sendInvoice} from "../controllers/SendInvoiceController.js";

const setupCreateInvoiceRoute = (expressApp: Express): void => {
    const createInvoice: Router = Router();
    createInvoice.post("/api/invoice", sendInvoice);
    expressApp.use(createInvoice);
}

export default setupCreateInvoiceRoute;