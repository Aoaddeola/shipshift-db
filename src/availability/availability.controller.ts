// src/availability/availability.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service.js';
import { OperatorAvailabilityCreateDto } from './availability-create.dto.js';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  async createAvailability(
    @Body() availability: OperatorAvailabilityCreateDto,
  ) {
    return this.availabilityService.createAvailability(availability);
  }

  @Get(':id')
  async getAvailability(@Param('id') id: string) {
    return this.availabilityService.getAvailability(id);
  }

  @Get()
  async getAvailabilities() {
    return this.availabilityService.getAvailabilities();
  }

  @Delete(':id')
  async deleteAvailability(@Param('id') id: string) {
    return this.availabilityService.deleteAvailability(id);
  }
}
