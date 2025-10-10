// src/planning/planning.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PlanJourneyRequestDto } from './plan-journey-request.dto.js';
import { PlanJourneyResponseDto } from './plan-journey-response.dto.js';
import { PlanningService } from './planning.service.js';

@Controller('planning')
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Post('journey')
  async planJourney(
    @Body() planJourneyRequestDto: PlanJourneyRequestDto,
  ): Promise<PlanJourneyResponseDto> {
    try {
      console.log('00000000000000000000000', planJourneyRequestDto);
      return await this.planningService.planJourney(planJourneyRequestDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to plan journey',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
