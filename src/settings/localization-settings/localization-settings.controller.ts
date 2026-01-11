import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LocalizationSettingsService } from './localization-settings.service.js';
import { LocalizationSettingsModel } from './localization-settings.model.js';
import { LocalizationSettings } from './localization-settings.types.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@Controller('localization-settings')
export class LocalizationSettingsController {
  constructor(
    private readonly localizationSettingsService: LocalizationSettingsService,
  ) {}

  @Post()
  async create(
    @Body()
    localizationSettings: Omit<
      LocalizationSettings,
      'id' | 'createdAt' | 'updatedAt'
    >,
  ): Promise<LocalizationSettingsModel> {
    return this.localizationSettingsService.create(localizationSettings);
  }

  @Get()
  async findAll(): Promise<LocalizationSettingsModel[]> {
    return this.localizationSettingsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LocalizationSettingsModel> {
    return this.localizationSettingsService.findOne(id);
  }

  @Get('owner/:ownerId')
  async findByOwner(
    @Param('ownerId') ownerId: string,
  ): Promise<LocalizationSettingsModel> {
    return this.localizationSettingsService.findByOwner(ownerId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() localizationSettings: Partial<LocalizationSettings>,
    @Req() request,
  ): Promise<LocalizationSettingsModel> {
    if (request.user.sub !== localizationSettings.ownerId) {
      throw new ForbiddenException(
        'You are not authorized to make modifications',
      );
    }
    return this.localizationSettingsService.update(id, localizationSettings);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.localizationSettingsService.remove(id);
  }
}
