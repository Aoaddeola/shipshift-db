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
  UseGuards,
} from '@nestjs/common';
import { JourneyService } from './journey.service.js';
import { JourneyCreateDto } from './journey-create.dto.js';
import { JourneyUpdateDto } from './journey-update.dto.js';
import { JourneyStatus } from './journey.types.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('journey')
export class JourneyController {
  constructor(private readonly journeyService: JourneyService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
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
    @Query('fragile') fragile?: string,
    @Query('perishable') perishable?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (agentId && locationId && status && fragile && perishable) {
      return this.journeyService.getJourneysByAllFilters(
        agentId,
        locationId,
        status,
        fragile === 'true',
        perishable === 'true',
        includeArray,
      );
    } else if (agentId && locationId && status && fragile) {
      return this.journeyService.getJourneysByAgentLocationStatusAndFragile(
        agentId,
        locationId,
        status,
        fragile === 'true',
        includeArray,
      );
    } else if (agentId && locationId && status && perishable) {
      return this.journeyService.getJourneysByAgentLocationStatusAndPerishable(
        agentId,
        locationId,
        status,
        perishable === 'true',
        includeArray,
      );
    } else if (agentId && locationId && fragile && perishable) {
      return this.journeyService.getJourneysByAgentLocationAndHandling(
        agentId,
        locationId,
        fragile === 'true',
        perishable === 'true',
        includeArray,
      );
    } else if (agentId && status && fragile && perishable) {
      return this.journeyService.getJourneysByAgentStatusAndHandling(
        agentId,
        status,
        fragile === 'true',
        perishable === 'true',
        includeArray,
      );
    } else if (locationId && status && fragile && perishable) {
      return this.journeyService.getJourneysByLocationStatusAndHandling(
        locationId,
        status,
        fragile === 'true',
        perishable === 'true',
        includeArray,
      );
    } else if (agentId && locationId && status) {
      return this.journeyService.getJourneysByAgentLocationAndStatus(
        agentId,
        locationId,
        status,
        includeArray,
      );
    } else if (agentId && locationId && fragile) {
      return this.journeyService.getJourneysByAgentLocationAndFragile(
        agentId,
        locationId,
        fragile === 'true',
        includeArray,
      );
    } else if (agentId && locationId && perishable) {
      return this.journeyService.getJourneysByAgentLocationAndPerishable(
        agentId,
        locationId,
        perishable === 'true',
        includeArray,
      );
    } else if (agentId && status && fragile) {
      return this.journeyService.getJourneysByAgentStatusAndFragile(
        agentId,
        status,
        fragile === 'true',
        includeArray,
      );
    } else if (agentId && status && perishable) {
      return this.journeyService.getJourneysByAgentStatusAndPerishable(
        agentId,
        status,
        perishable === 'true',
        includeArray,
      );
    } else if (agentId && fragile && perishable) {
      return this.journeyService.getJourneysByAgentAndHandling(
        agentId,
        fragile === 'true',
        perishable === 'true',
        includeArray,
      );
    } else if (locationId && status && fragile) {
      return this.journeyService.getJourneysByLocationStatusAndFragile(
        locationId,
        status,
        fragile === 'true',
        includeArray,
      );
    } else if (locationId && status && perishable) {
      return this.journeyService.getJourneysByLocationStatusAndPerishable(
        locationId,
        status,
        perishable === 'true',
        includeArray,
      );
    } else if (locationId && fragile && perishable) {
      return this.journeyService.getJourneysByLocationAndHandling(
        locationId,
        fragile === 'true',
        perishable === 'true',
        includeArray,
      );
    } else if (status && fragile && perishable) {
      return this.journeyService.getJourneysByStatusAndHandling(
        status,
        fragile === 'true',
        perishable === 'true',
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
    } else if (agentId && fragile) {
      return this.journeyService.getJourneysByAgentAndFragile(
        agentId,
        fragile === 'true',
        includeArray,
      );
    } else if (agentId && perishable) {
      return this.journeyService.getJourneysByAgentAndPerishable(
        agentId,
        perishable === 'true',
        includeArray,
      );
    } else if (locationId && status) {
      return this.journeyService.getJourneysByLocationAndStatus(
        locationId,
        status,
        includeArray,
      );
    } else if (locationId && fragile) {
      return this.journeyService.getJourneysByLocationAndFragile(
        locationId,
        fragile === 'true',
        includeArray,
      );
    } else if (locationId && perishable) {
      return this.journeyService.getJourneysByLocationAndPerishable(
        locationId,
        perishable === 'true',
        includeArray,
      );
    } else if (status && fragile) {
      return this.journeyService.getJourneysByStatusAndFragile(
        status,
        fragile === 'true',
        includeArray,
      );
    } else if (status && perishable) {
      return this.journeyService.getJourneysByStatusAndPerishable(
        status,
        perishable === 'true',
        includeArray,
      );
    } else if (fragile && perishable) {
      return this.journeyService.getJourneysByHandling(
        fragile === 'true',
        perishable === 'true',
        includeArray,
      );
    } else if (agentId) {
      return this.journeyService.getJourneysByAgent(agentId, includeArray);
    } else if (locationId) {
      return this.journeyService.getJourneysByLocation(
        locationId,
        includeArray,
      );
    } else if (status) {
      return this.journeyService.getJourneysByStatus(status, includeArray);
    } else if (fragile) {
      return this.journeyService.getJourneysByFragile(
        fragile === 'true',
        includeArray,
      );
    } else if (perishable) {
      return this.journeyService.getJourneysByPerishable(
        perishable === 'true',
        includeArray,
      );
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

  @Get('fragile/:fragile')
  async getJourneysByFragile(
    @Param('fragile') fragile: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.journeyService.getJourneysByFragile(
      fragile === 'true',
      includeArray,
    );
  }

  @Get('perishable/:perishable')
  async getJourneysByPerishable(
    @Param('perishable') perishable: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.journeyService.getJourneysByPerishable(
      perishable === 'true',
      includeArray,
    );
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
