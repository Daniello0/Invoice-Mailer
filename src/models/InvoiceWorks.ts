import {BelongsTo, ForeignKey, Model, Table} from "sequelize-typescript";
import {Invoice} from "./Invoice.js";
import {AutoIncrement, Column, DataType, PrimaryKey} from "sequelize-typescript/dist/index.js";


@Table({tableName: 'invoice_works'})
export class InvoiceWork extends Model<InvoiceWork> {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare id: bigint;

    @ForeignKey(() => Invoice)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    invoice_log_id!: bigint;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    cost!: number

    @BelongsTo(() => Invoice)
    invoice!: Invoice;
}