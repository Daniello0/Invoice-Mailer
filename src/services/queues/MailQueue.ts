import {Job, Queue, Worker} from "bullmq";
import {Redis} from "ioredis/built/index.js";
import console from "node:console";
import MailSender from "../mail/MailSender.js";

let mailQueueName: string;
let mailQueue: Queue;
let mailWorker: Worker;

export const initMailQueue = (name: string, connection: Redis) => {
    try {
        mailQueueName = name;

        mailQueue = new Queue(name, {connection: connection});

        mailWorker = new Worker(name, processJob, {
            connection: connection,
        });

        setupWorkerEvents();
    } catch (error) {
        throw error;
    }
}

export const addMailJob = async (data: Buffer): Promise<void> => {
    try {
        await mailQueue.add(mailQueueName, data);
    } catch (error) {
        throw error;
    }
}

const processJob = async (job: Job): Promise<void> => {
    console.log(`Worker ${mailQueueName}: Начал отправлять почту с данными`);

    // await MailSender.sendPdfToClient(client.email, pdfBuffer);
    await MailSender.sendTestEmail(Buffer.from(job.data.data, 'base64'));

    console.log(`Завершил отправку почты`);
}

const setupWorkerEvents = (): void => {
    mailWorker.on("completed", (_job, _result) => {
        console.log(`Worker '${mailQueueName}': Инвойс успешно отправлен.`);
    });

    mailWorker.on("failed", (_job: Job, err: Error) => {
        try {
            console.log(`Worker '${mailQueueName}': Ошибка при отправке инвойса`, err);
        } catch (error) {
            throw error;
        }
    });
}