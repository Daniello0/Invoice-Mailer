import { Invoice } from "../models/Invoice.js";
import axios, {AxiosInstance, AxiosResponse} from "axios";
import * as console from "node:console";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:" + process.env.APP_PORT,
});

async function testPostRequest() {
  const dataset = new Invoice("daniilreservemail@gmail.com");
  dataset.addWork("Работа 1", 100);
  dataset.addWork("Работа 2", 200);
  dataset.addWork("Скидка", -30);

  console.log(JSON.stringify(dataset, null, 2));
  console.log(`${api.getUri()}`);

  const res: AxiosResponse = await api.post("/api/invoice", dataset);
  if (res) {
    console.log(res.status);
  }
}

// ТЕСТЫ
await testPostRequest();
