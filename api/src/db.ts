import {
  Column,
  ForeignKey,
  Model,
  Sequelize,
  Table,
} from "sequelize-typescript";

@Table
export class Barber extends Model {
  @Column
  name: string;

  @Column
  username: string;

  @Column
  password: string;
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
}

@Table
export class Message extends Model {
  @Column
  text: string;

  @ForeignKey(() => Customer)
  @Column
  customerId: number;
}

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  models: [Barber, Customer, Message],
});
