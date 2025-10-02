import {Invoice} from "../../models/Invoice.js";
import console from "node:console";

export const addInvoiceToLogs = async (invoice: Invoice): Promise<void> => {
    try {
        await Invoice.upsert({
            email: invoice.email,
            works: invoice.works,
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