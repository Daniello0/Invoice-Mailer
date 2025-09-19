import { Client } from "../models/Client.js";
import { Invoice } from "../models/Invoice.js";
import path from "node:path";
import React from "react";
import fs from "fs";
import PdfGenerator from "./pdf/PdfGenerator.js";
import MailSender from "./mail/MailSender.js";
import PdfView from "../views/PdfView.js";

/*
TODO: Убрать класс Factory, сперва перенести все в QueueController.ts
 */
export default class Factory {
  static async generateAndSendPdfToClient({
    client,
    invoice,
  }: {
    client: Client;
    invoice: Invoice;
  }) {
    try {
      const cssString = this.getCssString("src/views/PdfView.css");

      const reactComponentWithProps = (
        <PdfView invoice={invoice} client={client} styles={cssString} />
      );

      const pdfBuffer: Buffer = await PdfGenerator.generateInvoicePdf(
        reactComponentWithProps,
      );

      // await MailSender.sendPdfToClient(client.email, pdfBuffer);
      await MailSender.sendTestEmail(pdfBuffer);
    } catch (error) {
      throw error;
    }
  }

  private static getCssString(filepath: string) {
    try {
      const cssFilePath = path.resolve(process.cwd(), filepath);
      return fs.readFileSync(cssFilePath, "utf8");
    } catch (error) {
      throw error;
    }
  }
}
