import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { LocalizationSettingsController } from './localization-settings.controller.js';
import { LocalizationSettingsService } from './localization-settings.service.js';
import { JwtModule } from '@nestjs/jwt';
import { LocalizationSettingsModel } from './localization-settings.model.js';

@Module({
  imports: [SequelizeModule.forFeature([LocalizationSettingsModel]), JwtModule],
  controllers: [LocalizationSettingsController],
  providers: [LocalizationSettingsService],
  exports: [LocalizationSettingsService],
})
export class LocalizationSettingsModule {}
