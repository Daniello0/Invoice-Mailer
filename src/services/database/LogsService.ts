import { Invoice } from "../../models/Invoice.js";
import console from "node:console";
import { InvoiceInterface } from "../../controllers/SendInvoiceController.js";
import { InvoiceWork } from "../../models/InvoiceWorks.js";
import { addWorks } from "./WorksService.js";

export const addInvoiceToLogs = async (
  invoice: InvoiceInterface,
): Promise<void> => {
  try {
    const [invoiceInstance] = await Invoice.upsert(
      {
        email: invoice.email,
        created_at: new Date(),
      },
      { returning: true },
    );

    const invoiceId: bigint = invoiceInstance.id;

    await InvoiceWork.destroy({ where: { invoice_log_id: invoiceId } });

    for (const work of invoice.works) {
      await addWorks(work, invoiceId);
    }
  } catch (error) {
    throw error;
  }
};

export const getInvoiceFromLogs = async (email: string): Promise<Invoice> => {
  email = email.trim();
  try {
    return await Invoice.findOne({
      where: { email },
      include: [InvoiceWork],
    });
  } catch (error) {
    console.error(`Ошибка при получении логов для email ${email}:`, error);
    throw error;
  }
};
