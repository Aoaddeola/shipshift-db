import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
} from '@nestjs/common';
import { JourneyService } from './journey.service.js';
import { JourneyCreateDto } from './journey-create.dto.js';
import { JourneyUpdateDto } from './journey-update.dto.js';
import { JourneyStatus } from './journey.types.js';

@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  async createJourney(@Body() journey: JourneyCreateDto) {
    return this.journeyService.createJourney(journey);
  }

  @Get(':id')
  async getJourney(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.journeyService.getJourney(id, includeArray);
  }

  @Get()
  async getJourneys(
    @Query('agentId') agentId?: string,
    @Query('locationId') locationId?: string,
    @Query('status') status?: JourneyStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (agentId && locationId && status) {
      return this.journeyService.getJourneysByAgentLocationAndStatus(
        agentId,
        locationId,
        status,
        includeArray,
      );
    } else if (agentId && locationId) {
      return this.journeyService.getJourneysByAgentAndLocation(
        agentId,
        locationId,
        includeArray,
      );
    } else if (agentId && status) {
      return this.journeyService.getJourneysByAgentAndStatus(
        agentId,
        status,
        includeArray,
      );
    } else if (locationId && status) {
      return this.journeyService.getJourneysByLocationAndStatus(
        locationId,
        status,
        includeArray,
      );
    } else if (agentId) {
      return this.journeyService.getJourneysByAgent(agentId, includeArray);
    } else if (locationId) {
      return this.journeyService.getJourneysFromLocation(
        locationId,
        includeArray,
      );
    } else if (status) {
      return this.journeyService.getJourneysByStatus(status, includeArray);
    }
    return this.journeyService.getJourneys(includeArray);
  }

  @Get('agent/:agentId')
  async getJourneysByAgent(
    @Param('agentId') agentId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.journeyService.getJourneysByAgent(agentId, includeArray);
  }

  @Get('location/from/:fromLocationId')
  async getJourneysFromLocation(
    @Param('fromLocationId') fromLocationId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.journeyService.getJourneysFromLocation(
      fromLocationId,
      includeArray,
    );
  }

  @Get('location/to/:toLocationId')
  async getJourneysToLocation(
    @Param('toLocationId') toLocationId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.journeyService.getJourneysToLocation(
      toLocationId,
      includeArray,
    );
  }

  @Get('status/:status')
  async getJourneysByStatus(
    @Param('status') status: JourneyStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.journeyService.getJourneysByStatus(status, includeArray);
  }

  @Put(':id')
  async updateJourney(
    @Param('id') id: string,
    @Body() journey: JourneyCreateDto,
  ) {
    return this.journeyService.updateJourney(id, journey);
  }

  @Patch(':id')
  async partialUpdateJourney(
    @Param('id') id: string,
    @Body() update: JourneyUpdateDto,
  ) {
    return this.journeyService.partialUpdateJourney(id, update);
  }

  @Delete(':id')
  async deleteJourney(@Param('id') id: string) {
    return this.journeyService.deleteJourney(id);
  }
}
