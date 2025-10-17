import * as console from "node:console";
import { HasMany, Model, Table } from "sequelize-typescript";
import {
  AutoIncrement,
  Column,
  DataType,
  PrimaryKey,
  Unique,
} from "sequelize-typescript/dist/index.js";
import { z, ZodSafeParseResult } from "zod";
import {
  InvoiceInterface,
  Work,
} from "../controllers/SendInvoiceController.js";
import { InvoiceWork } from "./InvoiceWorks.js";

interface validatorResult {
  success: boolean;
  errMsg: string;
}

const workSchema = z.object({
  name: z.string().min(1, "Название работы не может быть пустым"),
  cost: z.number(),
});

const invoiceSchema = z.object({
  email: z.email("Строка должна иметь вид электронной почты"),
  works: z.array(workSchema).nonempty("Массив работ не может быть пустым"),
});

@Table({ tableName: "invoice_logs" })
export class Invoice extends Model<Invoice> {
  @PrimaryKey
  @AutoIncrement
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare id: bigint;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email!: string;

  @HasMany(() => InvoiceWork, { onDelete: "CASCADE", hooks: true })
  works!: InvoiceWork[];

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;
}

export const validateInvoice = (invoice: InvoiceInterface): validatorResult => {
  console.log("Валидация данных...");

  const invoiceValidate = {
    email: invoice.email,
    works: invoice.works,
  };

  const result: ZodSafeParseResult<{ email: string; works: Work[] }> =
    invoiceSchema.safeParse(invoiceValidate);

  if (!result.error) {
    return {
      success: true,
      errMsg: "",
    };
  } else {
    return {
      success: false,
      errMsg: result.error.message,
    };
  }
};

export const parseWorks = (worksString: string): Work[] => {
  if (!worksString) {
    return [];
  }
  try {
    return JSON.parse(worksString);
  } catch (e) {
    console.error("Ошибка парсинга works:", e);
    return [];
  }
};
