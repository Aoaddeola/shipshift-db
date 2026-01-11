import { Column, AllowNull, Length, DataType } from 'sequelize-typescript';
import { BankAccount } from '../bank-account/bank-account.types.js';
import { LocalizationSettings } from '../localization-settings/localization-settings.types.js';
import { ContactDetails } from '../contact-details/contact-details.types.js';

export class SystemSettingsModel {
  /**
   * Owner ID - references the user or entity these settings belong to
   */
  @AllowNull(false)
  @Length({ min: 1, max: 100 })
  @Column
  ownerId!: string;

  /**
   * Bank Account information stored as JSON
   */
  @AllowNull(true)
  @Column(DataType.JSON)
  contactDetails?: ContactDetails;

  /**
   * Bank Account information stored as JSON
   */
  @AllowNull(true)
  @Column(DataType.JSON)
  bankAccount?: BankAccount;

  /**
   * Localization settings stored as JSON
   */
  @AllowNull(true)
  @Column(DataType.JSON)
  localization?: LocalizationSettings;
}
