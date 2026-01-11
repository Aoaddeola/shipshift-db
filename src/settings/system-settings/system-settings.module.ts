import { Module } from '@nestjs/common';
import { SystemSettingsController } from './system-settings.controller.js';
import { SystemSettingsService } from './system-settings.service.js';
import { JwtModule } from '@nestjs/jwt';
import { ContactDetailsModule } from '../contact-details/contact-details.module.js';
import { LocalizationSettingsModule } from '../localization-settings/localization-settings.module.js';
import { BankAccountModule } from '../bank-account/bank-account.module.js';

@Module({
  imports: [
    JwtModule,
    ContactDetailsModule,
    LocalizationSettingsModule,
    BankAccountModule,
  ],
  controllers: [SystemSettingsController],
  providers: [SystemSettingsService],
  exports: [SystemSettingsService],
})
export class SystemSettingsModule {}
