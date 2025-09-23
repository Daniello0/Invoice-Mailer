import {Queue, Worker, Job} from "bullmq";
import {Redis} from "ioredis/built/index.js";
import console from "node:console";
import MailSender from "../mail/MailSender.js";

export default class SendMailQueue {
    name: string;
    queue: Queue;
    worker: Worker;

    private readonly connection: Redis;

    constructor(name: string, connection: Redis) {
        try {
            this.name = name;
            this.connection = connection;

            this.queue = new Queue(name, {connection: this.connection});

            this.worker = new Worker(name, this.processJob, {
                connection: this.connection,
            });

            this.setupWorkerEvents();
        } catch (error) {
            throw error;
        }
    }

    private async processJob(job: Job): Promise<void> {
        console.log(`Worker ${this.name}: Начал отправлять почту с данными`);

        // await MailSender.sendPdfToClient(client.email, pdfBuffer);
        await MailSender.sendTestEmail(Buffer.from(job.data.data, 'base64'));

        console.log(`Завершил отправку почты`);
    }

    private setupWorkerEvents(): void {
        this.worker.on("completed", (_job, _result) => {
            console.log(`Worker '${this.name}': Инвойс успешно отправлен.`);
        });

        this.worker.on("failed", (_job: Job, err: Error) => {
            try {
                console.log(`Worker '${this.name}': Ошибка при отправке инвойса`, err);
            } catch (error) {
                throw error;
            }
        });
    }

    async addDataToQueue(data: Buffer): Promise<void> {
        try {
            await this.queue.add(this.name, data);
        } catch (error) {
            throw error;
        }
    }
}