import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import CssService from "../../services/css/CssService.js";
import * as console from "node:console";
import PdfGenerator from "../pdf/PdfGenerator.js";
import MailSender from "../../services/mail/MailSender.js";
import PdfView from "../../views/PdfView.js";
import React from "react";
import Element = React.JSX.Element;
import {Client} from "../../models/Client.js";
import {Invoice} from "../../models/Invoice.js";

/*
TODO: Разбить одну очередь на 2: создание пдф и отправка почты (GeneratePdfQueue.ts, SendMailQueue.ts)
 */
export default class QueueController {
  name: string;
  queue: Queue;
  worker: Worker;

  private readonly connection: Redis;

  constructor(name: string, connection: Redis) {
    try {
      this.name = name;
      this.connection = connection;

      this.queue = new Queue(name, { connection: this.connection });

      this.worker = new Worker(name, this.processJob, {
        connection: this.connection,
      });

      this.setupWorkerEvents();
    } catch (error) {
      throw error;
    }
  }

  private async processJob(job: Job): Promise<object> {
    try {
      console.log(
        `Начал обрабатывать инвойс #${job.data.invoice.id} с данными:`,
        job.data.invoice,
      );

      const client: Client = job.data.client;
      const invoice: Invoice = job.data.invoice;

      const cssString: string = CssService.getCssString("src/views/PdfView.css");

      const reactComponentWithProps: Element = (
          <PdfView invoice={invoice} client={client} styles={cssString} />
      );
      const pdfBuffer: Buffer = await PdfGenerator.generateInvoicePdf(
          reactComponentWithProps,
      );

      // await MailSender.sendPdfToClient(client.email, pdfBuffer);
      await MailSender.sendTestEmail(pdfBuffer);

      console.log(`Завершил обработку инвойса #${job.data.invoice.id}`);
      return { received: job.data, processed: true };
    } catch (error) {
      throw error;
    }
  }

  private setupWorkerEvents(): void {
    this.worker.on("completed", (job, result) => {
      console.log(
        `Worker '${this.name}': Инвойс ${job.data.invoice.id} успешно отправлен!
             Результат:`,
        result,
      );
    });

    this.worker.on("failed", (job: Job, err: Error) => {
      try {
        console.log(
          `Worker '${this.name}': Ошибка в инвойсе ${job?.data.invoice.id}!`,
          err,
        );
      } catch (error) {
        throw error;
      }
    });
  }

  async addDataToQueue(data: object): Promise<Job> {
    try {
      return this.queue.add(this.name, data);
    } catch (error) {
      throw error;
    }
  }
}
