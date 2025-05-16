// src/colony-badge/colony-badge.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ColonyBadgeService } from './badge.service.js';
import { ColonyBadgeCreateDto } from './badge-create.dto.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('colony-badge')
export class ColonyBadgeController {
  constructor(private readonly colonyBadgeService: ColonyBadgeService) {}

  @Post()
  async createColonyBadge(@Body() badge: ColonyBadgeCreateDto) {
    return this.colonyBadgeService.createColonyBadge(badge);
  }

  @Get(':id')
  async getColonyBadge(@Param('id') id: string) {
    return this.colonyBadgeService.getColonyBadge(id);
  }

  @Get()
  async getColonyBadges() {
    return this.colonyBadgeService.getColonyBadges();
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteColonyBadge(@Param('id') id: string) {
    return this.colonyBadgeService.deleteColonyBadge(id);
  }
}
