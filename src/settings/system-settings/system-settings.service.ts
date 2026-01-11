import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SystemSettingsModel } from './system-settings.model.js';
import { LocalizationSettingsService } from '../localization-settings/localization-settings.service.js';
import { BankAccountService } from '../bank-account/bank-account.service.js';
import { ContactDetailsService } from '../contact-details/contact-details.service.js';

@Injectable()
export class SystemSettingsService {
  private logger = new Logger(SystemSettingsService.name);
  constructor(
    @Inject(ContactDetailsService)
    private contactDetailsModel: ContactDetailsService,
    @Inject(LocalizationSettingsService)
    private localizationSettingsModel: LocalizationSettingsService,
    @Inject(BankAccountService)
    private bankAccountModel: BankAccountService,
  ) {}

  async findByOwner(ownerId: string): Promise<SystemSettingsModel> {
    const contactDetails = await this.contactDetailsModel.findByOwner(ownerId);
    const localizationSettings =
      await this.localizationSettingsModel.findByOwner(ownerId);
    const bankAccount = await this.bankAccountModel.findByOwner(ownerId);

    if (contactDetails.length === 0 && !localizationSettings && !bankAccount) {
      throw new NotFoundException(
        `No system settings found for owner ${ownerId}`,
      );
    }

    const cDetails = contactDetails[0];
    const bAccount = bankAccount?.[0] || undefined;
    const localization = localizationSettings?.dataValues;

    return {
      ownerId,
      contactDetails: cDetails,
      bankAccount: bAccount,
      localization,
    };
  }
}
