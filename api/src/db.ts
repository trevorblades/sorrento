import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Sequelize,
  Table,
} from "sequelize-typescript";

@Table
export class Barber extends Model {
  @Column
  name: string;

  @Column
  email: string;

  @Column
  password: string;

  @HasMany(() => Customer)
  customers: Customer[];
}

@Table
export class Customer extends Model {
  @Column
  name: string;

  @Column
  phone: string;

  @Column
  receipt: string;

  @Column
  servedAt: Date;

  @ForeignKey(() => Barber)
  @Column
  barberId: number;

  @BelongsTo(() => Barber)
  servedBy: Barber;

  @HasMany(() => Message)
  messages: Message[];
}

@Table
export class Message extends Model {
  @Column
  text: string;

  @ForeignKey(() => Customer)
  @Column
  customerId: number;

  @BelongsTo(() => Customer)
  customer: Customer;
}

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  models: [Barber, Customer, Message],
});
