import { Work } from "../../controllers/SendInvoiceController.js";
import { InvoiceWork } from "../../models/InvoiceWorks.js";

export const addWorks = async (
  work: Work,
  invoiceLogId: bigint,
): Promise<void> => {
  try {
    await InvoiceWork.upsert({
      name: work.name,
      cost: work.cost,
      invoice_log_id: invoiceLogId,
    });
  } catch (error) {
    throw error;
  }
};
