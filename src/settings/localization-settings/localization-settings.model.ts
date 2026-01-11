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
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

/**
 * Localization Settings Model
 *
 * @Table - Defines the table name and configuration
 */
@Table({
  tableName: 'localization_settings',
  timestamps: true,
  updatedAt: 'updatedAt',
  createdAt: 'createdAt',
})
export class LocalizationSettingsModel extends Model {
  /**
   * Unique identifier for the localization settings record
   */
  @PrimaryKey
  @IsUUID(4)
  @Default(uuidv4)
  @Column
  id!: string;

  /**
   * Owner ID - references the user or entity these settings belong to
   */
  @Unique('owner_unique')
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column
  ownerId!: string;

  /**
   * Language code (e.g., 'en', 'fr', 'es')
   */
  @AllowNull(false)
  @Length({ min: 2, max: 10 })
  @Column
  language!: string;

  /**
   * Currency code (e.g., 'USD', 'EUR', 'GBP')
   */
  @AllowNull(false)
  @Length({ min: 3, max: 3 })
  @Column
  currency!: string;

  /**
   * Timezone (e.g., 'America/New_York', 'Europe/London')
   */
  @AllowNull(false)
  @Length({ min: 3, max: 50 })
  @Column
  timezone!: string;

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
  static validateBeforeCreate(instance: LocalizationSettingsModel) {
    if (!instance.language || !instance.currency || !instance.timezone) {
      throw new Error('Language, currency, and timezone are required');
    }
  }

  /**
   * Before update hook - validate required fields
   */
  @BeforeUpdate
  static validateBeforeUpdate(instance: LocalizationSettingsModel) {
    if (!instance.language || !instance.currency || !instance.timezone) {
      throw new Error('Language, currency, and timezone are required');
    }
  }
}
