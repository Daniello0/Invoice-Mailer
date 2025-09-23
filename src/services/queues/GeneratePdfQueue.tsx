import {Job, Queue, Worker} from "bullmq";
import {Redis} from "ioredis/built/index.js";
import console from "node:console";
import {Client} from "../../models/Client.js";
import {Invoice} from "../../models/Invoice.js";
import CssService from "../css/CssService.js";
import PdfView from "../../views/PdfView.js";
import PdfGenerator from "../pdf/PdfGenerator.js";
import React from "react";
import Element = React.JSX.Element;
import SendMailQueue from "./SendMailQueue.js";


export default class GeneratePdfQueue {
    name: string;
    queue: Queue;
    worker: Worker;
    mailSender: SendMailQueue

    private readonly connection: Redis;

    constructor(name: string, connection: Redis, mailSender: SendMailQueue) {
        try {
            this.name = name;
            this.connection = connection;

            this.queue = new Queue(name, {connection: this.connection});

            this.worker = new Worker(name, this.processJob, {
                connection: this.connection,
            });

            this.mailSender = mailSender;

            this.setupWorkerEvents()
        } catch (error) {
            throw error;
        }
    }

    private setupWorkerEvents() {
        this.worker.on("completed", async (job, result: Buffer) => {
            console.log(`Worker '${this.name}': PDF #${job.data.invoice.id} успешно создан. Результат:`, result);

            console.log("Передача pdfBuffer в очередь по отправке писем...");
            await this.mailSender.addDataToQueue(result);
        });

        this.worker.on("failed", (job: Job, error: Error) => {
            try {
                console.log(`Worker '${this.name}': Ошибка при создании PDF #${job?.data.invoice.id}`, error);
            } catch (error) {
                throw error;
            }
        });
    }

    private async processJob(job: Job): Promise<Buffer> {
        try {
            console.log(
                `Worker ${this.name}: Начал создавать PDF #${job.data.invoice.id} с данными:`, job.data.invoice);

            const client: Client = job.data.client;
            const invoice: Invoice = job.data.invoice;

            const cssString: string = CssService.getCssString("src/views/PdfView.css");

            const reactComponentWithProps: Element = (
                <PdfView invoice={invoice} client={client} styles={cssString} />
            );
            return await PdfGenerator.generateInvoicePdf(
                reactComponentWithProps,
            );
        } catch (error) {
            throw error;
        }
    }

    async addDataToQueue(data: object): Promise<Job> {
        try {
            return this.queue.add(this.name, data);
        } catch (error) {
            throw error;
        }
    }
}