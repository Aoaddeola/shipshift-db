import { BankAccount } from '../bank-account/bank-account.types.js';
import { ContactDetails } from '../contact-details/contact-details.types.js';
import { LocalizationSettings } from '../localization-settings/localization-settings.types.js';

export interface SystemSettings {
  bankAccount?: BankAccount;
  localization?: LocalizationSettings;
  contactDetails: ContactDetails;
}
