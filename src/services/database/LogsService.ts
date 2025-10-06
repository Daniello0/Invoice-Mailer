import {Invoice} from "../../models/Invoice.js";
import console from "node:console";
import {InvoiceInterface} from "../../controllers/SendInvoiceController.js";

export const addInvoiceToLogs = async (invoice: InvoiceInterface): Promise<void> => {
    try {
        await Invoice.upsert({
            email: invoice.email,
            works: JSON.stringify(invoice.works),
            created_at: new Date(),
        });
    } catch (error) {
        throw error;
    }
};

export const getInvoiceFromLogs = async (email: string): Promise<Invoice> => {
    email = email.trim();
    try {
        return await Invoice.findOne({
            where: {email},
        });
    } catch (error) {
        console.error(`Ошибка при получении логов для email ${email}:`, error);
        throw error;
    }
}