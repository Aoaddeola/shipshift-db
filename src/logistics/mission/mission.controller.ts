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
import { MissionService } from './mission.service.js';
import { MissionCreateDto } from './mission-create.dto.js';
import { MissionUpdateDto } from './mission-update.dto.js';
import { MissionStatus } from './mission.types.js';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post()
  async createMission(@Body() mission: MissionCreateDto) {
    return this.missionService.createMission(mission);
  }

  @Get(':id')
  async getMission(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.missionService.getMission(id, includeArray);
  }

  @Get()
  async getMissions(
    @Query('curatorId') curatorId?: string,
    @Query('fromLocationId') fromLocationId?: string,
    @Query('toLocationId') toLocationId?: string,
    @Query('status') status?: MissionStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (curatorId && fromLocationId && toLocationId && status) {
      return this.missionService.getMissionsByAllFilters(
        curatorId,
        fromLocationId,
        toLocationId,
        status,
        includeArray,
      );
    } else if (curatorId && fromLocationId && toLocationId) {
      return this.missionService.getMissionsByCuratorAndLocations(
        curatorId,
        fromLocationId,
        toLocationId,
        includeArray,
      );
    } else if (curatorId && fromLocationId && status) {
      return this.missionService.getMissionsByCuratorFromLocationAndStatus(
        curatorId,
        fromLocationId,
        status,
        includeArray,
      );
    } else if (curatorId && toLocationId && status) {
      return this.missionService.getMissionsByCuratorToLocationAndStatus(
        curatorId,
        toLocationId,
        status,
        includeArray,
      );
    } else if (fromLocationId && toLocationId && status) {
      return this.missionService.getMissionsByLocationsAndStatus(
        fromLocationId,
        toLocationId,
        status,
        includeArray,
      );
    } else if (curatorId && fromLocationId) {
      return this.missionService.getMissionsByCuratorAndFromLocation(
        curatorId,
        fromLocationId,
        includeArray,
      );
    } else if (curatorId && toLocationId) {
      return this.missionService.getMissionsByCuratorAndToLocation(
        curatorId,
        toLocationId,
        includeArray,
      );
    } else if (curatorId && status) {
      return this.missionService.getMissionsByCuratorAndStatus(
        curatorId,
        status,
        includeArray,
      );
    } else if (fromLocationId && toLocationId) {
      return this.missionService.getMissionsByLocations(
        fromLocationId,
        toLocationId,
        includeArray,
      );
    } else if (fromLocationId && status) {
      return this.missionService.getMissionsByFromLocationAndStatus(
        fromLocationId,
        status,
        includeArray,
      );
    } else if (toLocationId && status) {
      return this.missionService.getMissionsByToLocationAndStatus(
        toLocationId,
        status,
        includeArray,
      );
    } else if (curatorId) {
      return this.missionService.getMissionsByCurator(curatorId, includeArray);
    } else if (fromLocationId) {
      return this.missionService.getMissionsByFromLocation(
        fromLocationId,
        includeArray,
      );
    } else if (toLocationId) {
      return this.missionService.getMissionsByToLocation(
        toLocationId,
        includeArray,
      );
    } else if (status) {
      return this.missionService.getMissionsByStatus(status, includeArray);
    }
    return this.missionService.getMissions(includeArray);
  }

  @Get('curator/:curatorId')
  async getMissionsByCurator(
    @Param('curatorId') curatorId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.missionService.getMissionsByCurator(curatorId, includeArray);
  }

  @Get('from/:fromLocationId')
  async getMissionsByFromLocation(
    @Param('fromLocationId') fromLocationId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.missionService.getMissionsByFromLocation(
      fromLocationId,
      includeArray,
    );
  }

  @Get('to/:toLocationId')
  async getMissionsByToLocation(
    @Param('toLocationId') toLocationId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.missionService.getMissionsByToLocation(
      toLocationId,
      includeArray,
    );
  }

  @Get('status/:status')
  async getMissionsByStatus(
    @Param('status') status: MissionStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.missionService.getMissionsByStatus(status, includeArray);
  }

  @Put(':id')
  async updateMission(
    @Param('id') id: string,
    @Body() mission: MissionCreateDto,
  ) {
    return this.missionService.updateMission(id, mission);
  }

  @Patch(':id')
  async partialUpdateMission(
    @Param('id') id: string,
    @Body() update: MissionUpdateDto,
  ) {
    return this.missionService.partialUpdateMission(id, update);
  }

  @Delete(':id')
  async deleteMission(@Param('id') id: string) {
    return this.missionService.deleteMission(id);
  }
}
