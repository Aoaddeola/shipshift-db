import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  Delete,
} from '@nestjs/common';
import { JourneyCreateDto } from './journey-create.dto.js';
import { JourneyUpdateDto } from './journey-update.dto.js';
import { JourneyService } from './journey.service.js';
import { JourneyStatus } from './journey.types.js';

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

  @Get()
  async getJourneys() {
    return this.journeyService.getJourneys();
  }

  @Get('agent/:agentId')
  async getJourneysByAgent(@Param('agentId') agentId: string) {
    return this.journeyService.getJourneysByAgent(agentId);
  }

  @Get('location/from/:fromLocationId')
  async getJourneysFromLocation(
    @Param('fromLocationId') fromLocationId: string,
  ) {
    return this.journeyService.getJourneysFromLocation(fromLocationId);
  }

  @Get('location/to/:toLocationId')
  async getJourneysToLocation(@Param('toLocationId') toLocationId: string) {
    return this.journeyService.getJourneysToLocation(toLocationId);
  }

  @Get('status/:status')
  async getJourneysByStatus(@Param('status') status: JourneyStatus) {
    return this.journeyService.getJourneysByStatus(status);
  }

  @Delete(':id')
  async deleteJourney(@Param('id') id: string) {
    return this.journeyService.deleteJourney(id);
  }
}
