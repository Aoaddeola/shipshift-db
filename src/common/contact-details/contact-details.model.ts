import {
  Table,
  Column,
  Model,
  PrimaryKey,
  IsUUID,
  AllowNull,
  IsEmail,
  Default,
  Unique,
  Length,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ContactDetails } from './contact-details.types.js';

/**
 * Contact Details Model
 *
 * @Table - Defines the table name and configuration
 */
@Table({
  tableName: 'contact_details',
  timestamps: true,
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
})
export class ContactDetailsModel extends Model {
  /**
   * Unique identifier for the contact details record
   */
  @PrimaryKey
  @IsUUID(4)
  @Default(uuidv4)
  @Column
  id!: string;

  /**
   * Owner ID - references the user or entity this contact belongs to
   */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column
  ownerId!: string;

  /**
   * Phone number in E.164 format (e.g., +1234567890)
   */
  @AllowNull(true)
  // @Is('phone', {
  //   args: [/^\+?[1-9]\d{1,14}$/, 'i'],
  //   msg: 'Phone number must be in E.164 format (e.g., +1234567890)',
  // })
  @Length({ min: 5, max: 20 })
  @Column
  phone?: string;

  /**
   * SMS notification number (can be same as phone)
   */
  @AllowNull(true)
  // @Is('sms', {
  //   args: [/^\+?[1-9]\d{1,14}$/, 'i'],
  //   msg: 'SMS number must be in E.164 format (e.g., +1234567890)',
  // })
  @Length({ min: 5, max: 20 })
  @Column
  sms?: string;

  /**
   * Email address
   */
  @AllowNull(true)
  @IsEmail
  @Length({ min: 5, max: 255 })
  @Column
  email?: string;

  /**
   * Email address
   */
  @AllowNull(true)
  @Column
  url?: string;

  /**
   * Session identifier
   */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Unique('session_unique')
  @Column
  sessionId!: string;

  /**
   * Created at timestamp
   */
  @AllowNull(false)
  @Column
  createdAt!: Date;

  /**
   * Updated at timestamp
   */
  @AllowNull(false)
  @Column
  updatedAt!: Date;

  /**
   * Before create hook - validate required fields
   */
  @BeforeCreate
  static validateBeforeCreate(instance: ContactDetails) {
    if (!instance.phone && !instance.sms && !instance.email) {
      throw new Error(
        'At least one contact method (phone, sms, or email) must be provided',
      );
    }
  }

  /**
   * Before update hook - validate required fields
   */
  @BeforeUpdate
  static validateBeforeUpdate(instance: ContactDetails) {
    if (!instance.phone && !instance.sms && !instance.email) {
      throw new Error(
        'At least one contact method (phone, sms, or email) must be provided',
      );
    }
  }
}
