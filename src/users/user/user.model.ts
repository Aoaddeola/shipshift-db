// src/users/entities/user.entity.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  IsEmail,
  Unique,
  AllowNull,
} from 'sequelize-typescript';
import { UserType } from './user.types.js';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @IsEmail
  @Column(DataType.STRING)
  email: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  password: string;

  @Column(DataType.STRING)
  name: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  avatar: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  refreshToken: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  isVerified: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(UserType)),
    defaultValue: UserType.USER,
    allowNull: false,
  })
  userType: UserType;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
