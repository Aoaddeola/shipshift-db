// src/addresses/models/address.model.ts
import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class ContactDetailsModel extends Model {
  @Column({ primaryKey: true })
  id: string;

  @Column({})
  ownerId: string;

  @Column({})
  phone: string; // Phone numbers should be strings to preserve formatting

  @Column({})
  sms: string; // SMS notification number (can be same as phone)

  @Column({})
  email: string;

  @Column({})
  session: string;
}
