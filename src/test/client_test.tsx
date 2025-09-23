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
  name: string;
  cost: number;
}

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:" + process.env.APP_PORT,
});

async function testPostRequest() {
  const dataset: InvoiceInterface = {
    email: 'daniilreservemail@gmail.com',
    works: [
      {name: 'Работа 1', cost: 200},
      {name: 'Работа 2', cost: 200},
      {name: 'Скидка', cost: -50}
    ]
  }

  console.log(JSON.stringify(dataset, null, 2));

  const res: AxiosResponse = await api.post("/api/invoice", dataset);
  if (res) {
    console.log(res.status);
  }
}

// ТЕСТЫ
await testPostRequest();
