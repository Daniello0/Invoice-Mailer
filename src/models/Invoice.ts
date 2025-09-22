import * as console from "node:console";
import {Model, Table} from "sequelize-typescript";
import {AutoIncrement, Column, DataType, PrimaryKey, Unique} from "sequelize-typescript/dist/index.js";
import {z, ZodSafeParseResult} from "zod";

export interface Work {
  name: string;
  cost: number;
}

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

@Table({tableName: 'invoice_logs'})
export class Invoice extends Model<Invoice>{
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

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: '[]'
  })
  works!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  created_at: Date;

  setEmail(email: string) {
    this.email = email;
  }

  getWorks(): Work[] {
    if (!this.works) {
      return [];
    }
    try {
      return JSON.parse(this.works);
    } catch (e) {
      console.error('Ошибка парсинга works:', e);
      return [];
    }
  }

  addWork(work: string, cost: number) {
    const currentWorks: Work[] = this.getWorks();
    currentWorks.push({ name: work, cost: cost });
    this.works = JSON.stringify(currentWorks);
  }

  static validateInvoice = (invoice: Invoice): validatorResult => {
    console.log("Валидация данных...");

    const invoiceValidate = {
      email: invoice.email,
      works: invoice.getWorks(),
    }

    const result: ZodSafeParseResult<{ email: string, works: Work[] }> = invoiceSchema.safeParse(invoiceValidate);

    if (!result.error) {
      return {
        success: true,
        errMsg: ""
      }
    } else {
      return {
        success: false,
        errMsg: result.error.message
      }
    }
  }
}
