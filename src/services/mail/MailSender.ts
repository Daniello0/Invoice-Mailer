import process from "node:process";
import nodemailer from "nodemailer";
import * as console from "node:console";
import sgMailer from '@sendgrid/mail'
import MailOptionsService from "./MailOptionsService.js";

const GMAIL_USER: string | undefined = process.env.GMAIL_USER;
const GMAIL_APP_PASS: string | undefined = process.env.GMAIL_APP_PASS;
const SENDGRID_API_KEY: string | undefined = process.env.SENDGRID_API_KEY;

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS,
  },
});

sgMailer.setApiKey(SENDGRID_API_KEY);

export default class MailSender {
  // Работает только при отправке с проверенного провайдера. Не работает, если отправлять через мобильную связь
  // или с использованием VPN
  static async sendPdfToClient(recipientEmail: string, pdfBuffer: Buffer) {
    const mailOptions = new MailOptionsService().setFrom(GMAIL_USER);

    try {
      const info = await transporter.sendMail(mailOptions.getMailOptions(recipientEmail, pdfBuffer));
      console.log("Письмо успешно отправлено: ", info.response);
    } catch (error) {
      throw error;
    }
  }

  // Работает только для daniilreservemail@gmail.com
  static async sendTestEmail(pdfBuffer: Buffer) {
    const mailOptions: MailOptionsService = new MailOptionsService();
    mailOptions.setParams({
      from: GMAIL_USER
    });

    try {
      await sgMailer.send(mailOptions.getSgMailOptions(pdfBuffer));
    } catch (error) {

      console.error('Ошибка при отправке письма через @sendgrid/mail:');
      if (error.response) {
        console.error('Тело ответа от SendGrid:', JSON.stringify(error.response.body, null, 2));
      } else {
        console.error(error);
      }
      throw error;
    }
  }
}
