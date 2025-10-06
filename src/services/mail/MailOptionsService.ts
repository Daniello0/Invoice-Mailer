export interface MailOptionsInterface {
    from: string
    to: string
    subject: string
    text: string
    attachments: AttachmentInterface[]
}

export interface AttachmentInterface {
    filename: string
    content: Buffer
    contentType: string
}

interface ParamsInterface {
    from: string
    subject?: string
    text?: string
    filename?: string,
    content?: string
}

export default class MailOptionsService {

    from: string;
    subject: string = "Счёт на оплату услуг";
    text: string = "Здравствуйте! Ваш счет за оплату выполненных услуг в приложении.";
    filename: string = "invoice.pdf";
    contentType: string = "application/pdf"

    setParams({ from, subject, text, filename, content } = {} as ParamsInterface) {
        if (from !== undefined) this.from = from;
        if (subject !== undefined) this.subject = subject;
        if (text !== undefined) this.text = text;
        if (filename !== undefined) this.filename = filename;
        if (content !== undefined) this.contentType = content; // исправлено
    }


    setFrom(from: string) {
        this.from = from;
        return this;
    }

    setSubject(subject: string) {
        this.subject = subject;
        return this;
    }

    setText(text: string) {
        this.text = text;
        return this;
    }

    setFilename(filename: string) {
        this.filename = filename;
        return this;
    }

    setContent(content: string = "application/pdf") {
        this.contentType = content;
        return this;
    }

    getSgMailOptions = (pdfBuffer: Buffer) => {
        return {
            to: this.from,
            from: this.from,
            subject: this.subject,
            text: this.text,
            attachments: [
                {
                    filename: this.filename,
                    content: pdfBuffer.toString("base64"),
                    type: this.contentType,
                }
            ],
        };
    }

    getMailOptions = (recipient: string, pdfBuffer: Buffer): MailOptionsInterface => {
        return {
            from: this.from,
            to: recipient,
            subject: this.subject,
            text: this.text,
            attachments: [
                {
                    filename: this.filename,
                    content: pdfBuffer,
                    contentType: this.contentType,
                },
            ],
        }
    }
}