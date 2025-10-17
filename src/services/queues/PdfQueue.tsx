import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis/built/index.js";
import console from "node:console";
import { Client } from "../../models/Client.js";
import { Invoice } from "../../models/Invoice.js";
import CssService from "../css/CssService.js";
import PdfView from "../../views/PdfView.js";
import PdfGenerator from "../pdf/PdfGenerator.js";
import React from "react";
import Element = React.JSX.Element;
import { addMailJob } from "./MailQueue.js";

let pdfQueueName: string;
let pdfQueue: Queue;
let pdfWorker: Worker;

export const initPdfQueue = (name: string, connection: Redis) => {
  try {
    pdfQueueName = name;

    pdfQueue = new Queue(name, { connection: connection });

    pdfWorker = new Worker(name, processJob, {
      connection: connection,
    });

    setupWorkerEvents();
  } catch (error) {
    throw error;
  }
};

export const addPdfJob = async (data: object): Promise<Job> => {
  try {
    return pdfQueue.add(pdfQueueName, data);
  } catch (error) {
    throw error;
  }
};

const processJob = async (job: Job): Promise<Buffer> => {
  try {
    console.log(
      `Worker ${pdfQueueName}: Начал создавать PDF #${job.data.invoice.id} с данными:`,
      job.data.invoice,
    );

    const client: Client = job.data.client;
    const invoice: Invoice = job.data.invoice;

    const cssString: string = CssService.getCssString("src/views/PdfView.css");

    const reactComponentWithProps: Element = (
      <PdfView invoice={invoice} client={client} styles={cssString} />
    );
    return await PdfGenerator.generateInvoicePdf(reactComponentWithProps);
  } catch (error) {
    throw error;
  }
};

const setupWorkerEvents = () => {
  pdfWorker.on("completed", async (job, result: Buffer) => {
    console.log(
      `Worker '${pdfQueueName}': PDF #${job.data.invoice.id} успешно создан. Результат:`,
      result,
    );

    console.log("Передача pdfBuffer в очередь по отправке писем...");
    await addMailJob(result);
  });

  pdfWorker.on("failed", (job: Job, error: Error) => {
    try {
      console.log(
        `Worker '${pdfQueueName}': Ошибка при создании PDF #${job?.data.invoice.id}`,
        error,
      );
    } catch (error) {
      throw error;
    }
  });
};
