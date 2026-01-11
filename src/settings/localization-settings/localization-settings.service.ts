import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LocalizationSettingsModel } from './localization-settings.model.js';
import { LocalizationSettings } from './localization-settings.types.js';

@Injectable()
export class LocalizationSettingsService {
  private logger = new Logger(LocalizationSettingsService.name);
  constructor(
    @InjectModel(LocalizationSettingsModel)
    private localizationSettingsModel: typeof LocalizationSettingsModel,
  ) {}

  async create(
    localizationSettings: Omit<
      LocalizationSettings,
      'id' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<LocalizationSettingsModel> {
    this.logger.debug('Creating localization settings', localizationSettings);
    return this.localizationSettingsModel.create(localizationSettings);
  }

  async findAll(): Promise<LocalizationSettingsModel[]> {
    return this.localizationSettingsModel.findAll();
  }

  async findOne(id: string): Promise<LocalizationSettingsModel> {
    const settings = await this.localizationSettingsModel.findByPk(id);
    if (!settings) {
      throw new NotFoundException(
        `Localization settings with ID ${id} not found`,
      );
    }
    return settings;
  }

  async findByOwner(ownerId: string): Promise<LocalizationSettingsModel> {
    const settings = await this.localizationSettingsModel.findOne({
      where: { ownerId },
    });

    if (!settings) {
      throw new NotFoundException(
        `No localization settings found for owner ${ownerId}`,
      );
    }

    return settings;
  }

  async update(
    id: string,
    localizationSettings: Partial<LocalizationSettings>,
  ): Promise<LocalizationSettingsModel> {
    // First, check if record exists
    const existing = await this.localizationSettingsModel.findOne({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(
        `Localization settings with ID ${id} not found`,
      );
    }

    // Perform update
    await this.localizationSettingsModel.update(localizationSettings, {
      where: { id },
    });

    // Fetch updated record
    const updated = await this.localizationSettingsModel.findByPk(id);
    if (!updated) {
      throw new NotFoundException(
        `Localization settings with ID ${id} not found`,
      );
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    if (record) {
      await record.destroy();
    }
  }

  async removeByOwner(ownerId: string): Promise<void> {
    const record = await this.findByOwner(ownerId);
    if (record) {
      await record.destroy();
    }
  }
}
