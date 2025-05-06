// src/journey/journey.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JourneyService } from './journey.service.js';
import { JourneyCreateDto } from './journey-create.dto.js';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  async createJourney(@Body() journey: JourneyCreateDto) {
    return this.journeyService.createJourney(journey);
  }

  @Get(':id')
  async getJourney(@Param('id') id: string) {
    return this.journeyService.getJourney(id);
  }

  @Get()
  async getJourneys() {
    return this.journeyService.getJourneys();
  }

  @Delete(':id')
  async deleteJourney(@Param('id') id: string) {
    return this.journeyService.deleteJourney(id);
  }
}
