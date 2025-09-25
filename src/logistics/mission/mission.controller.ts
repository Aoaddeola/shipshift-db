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
    @Query('status') status?: MissionStatus,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (curatorId && status) {
      return this.missionService.getMissionsByCuratorAndStatus(
        curatorId,
        status,
        includeArray,
      );
    } else if (curatorId) {
      return this.missionService.getMissionsByCurator(curatorId, includeArray);
    } else if (status) {
      return this.missionService.getMissionsByStatus(status, includeArray);
    }
    return this.missionService.getMissions(includeArray);
  }

  @Get('curator/:curatorId')
  async getMissionsByCuratorId(
    @Param('curatorId') curatorId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.missionService.getMissionsByCurator(curatorId, includeArray);
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
