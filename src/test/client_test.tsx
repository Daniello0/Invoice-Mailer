import axios, {AxiosInstance, AxiosResponse} from "axios";
import * as console from "node:console";
import process from "node:process";
import dotenv from "dotenv";

dotenv.config();

interface InvoiceInterface {
  email: string;
  works: Work[]
}

interface Work {
  work: string;
  cost: number;
}

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:" + process.env.APP_PORT,
});

async function testPostRequest() {
  const dataset: InvoiceInterface = {
    email: 'daniilreservemail@gmail.com',
    works: [
      {work: 'Работа 1', cost: 100},
      {work: 'Работа 2', cost: 200},
      {work: 'Скидка', cost: -50}
    ]
  }

  console.log(JSON.stringify(dataset, null, 2));
  console.log(`${api.getUri()}`);

  const res: AxiosResponse = await api.post("/api/invoice", dataset);
  if (res) {
    console.log(res.status);
  }
}

// ТЕСТЫ
await testPostRequest();
