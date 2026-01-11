import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service.js';
import { SystemSettingsModel } from './system-settings.model.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('owner/:ownerId')
  async findByOwner(
    @Param('ownerId') ownerId: string,
    @Req() request,
  ): Promise<SystemSettingsModel> {
    if (request.user.sub !== ownerId) {
      throw new ForbiddenException(
        'You are not authorized to view these settings',
      );
    }
    return this.systemSettingsService.findByOwner(ownerId);
  }
}
