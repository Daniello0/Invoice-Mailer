import validator from "validator";
import * as console from "node:console";
import {Model, Table} from "sequelize-typescript";
import {AutoIncrement, Column, DataType, PrimaryKey, Unique} from "sequelize-typescript/dist/index.js";

export interface Work {
  name: string;
  cost: number;
}

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
    type: DataType.STRING,  // Явно указываем тип
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

  // zod, yup - использовать для валидации
  static validateInvoice = (invoice: Invoice): boolean => {
    console.log("Валидация данных...");

    if (!invoice || typeof invoice !== 'object') return false;
    if (typeof invoice.email !== 'string' || !validator.isEmail(invoice.email)) return false;
    if (!Array.isArray(invoice.getWorks()) || invoice.getWorks().length === 0) return false;

    for (const work of invoice.getWorks()) {
      if (!work || typeof work !== 'object') return false;
      if (typeof work.name !== 'string' || work.name.trim().length === 0) return false;
      if (typeof work.cost !== 'number') return false;
    }

    return true;
  }
}
