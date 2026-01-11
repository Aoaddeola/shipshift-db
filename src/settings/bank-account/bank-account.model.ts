import {
  Table,
  Column,
  Model,
  PrimaryKey,
  IsUUID,
  AllowNull,
  Default,
  Unique,
  Length,
  BeforeCreate,
  BeforeUpdate,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bank Account Model
 *
 * @Table - Defines the table name and configuration
 */
@Table({
  tableName: 'bank_accounts',
  timestamps: true,
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
})
export class BankAccountModel extends Model {
  /**
   * Unique identifier for the bank account record
   */
  @PrimaryKey
  @IsUUID(4)
  @Default(uuidv4)
  @Column
  id!: string;

  /**
   * Owner ID - references the user or entity this bank account belongs to
   */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column
  ownerId!: string;

  /**
   * Name of the bank
   */
  @AllowNull(false)
  @Length({ min: 2, max: 100 })
  @Column
  bankName!: string;

  /**
   * Bank account number
   */
  @AllowNull(false)
  @Length({ min: 5, max: 50 })
  @Column
  accountNumber!: string;

  /**
   * Type of account (e.g., checking, savings, business)
   */
  @AllowNull(false)
  @Length({ min: 3, max: 50 })
  @Column
  accountType!: string;

  /**
   * Name of the account holder
   */
  @AllowNull(false)
  @Length({ min: 2, max: 100 })
  @Column
  accountHolderName!: string;

  /**
   * Created at timestamp
   */
  @CreatedAt
  @Column
  createdAt!: Date;

  /**
   * Updated at timestamp
   */
  @UpdatedAt
  @Column
  updatedAt!: Date;

  /**
   * Before create hook - validate required fields
   */
  @BeforeCreate
  static validateBeforeCreate(instance: BankAccountModel) {
    if (!instance.bankName || !instance.accountNumber || !instance.accountType || !instance.accountHolderName) {
      throw new Error('Bank name, account number, account type, and account holder name are required');
    }
  }

  /**
   * Before update hook - validate required fields
   */
  @BeforeUpdate
  static validateBeforeUpdate(instance: BankAccountModel) {
    if (!instance.bankName || !instance.accountNumber || !instance.accountType || !instance.accountHolderName) {
      throw new Error('Bank name, account number, account type, and account holder name are required');
    }
  }
}
