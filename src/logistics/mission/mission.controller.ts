import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { MissionCreateDto } from './mission-create.dto.js';
import { MissionUpdateDto } from './mission-update.dto.js';
import { MissionService } from './mission.service.js';
import { MissionStatus } from './mission.types.js';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post()
  async createMission(@Body() mission: MissionCreateDto) {
    return this.missionService.createMission(mission);
  }

  @Get(':id')
  async getMission(@Param('id') id: string) {
    return this.missionService.getMission(id);
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

  @Get()
  async getMissions(
    @Query('curatorId') curatorId?: string,
    @Query('status') status?: MissionStatus,
  ) {
    if (curatorId && status) {
      return this.missionService.getMissionsByCuratorAndStatus(
        curatorId,
        status,
      );
    } else if (curatorId) {
      return this.missionService.getMissionsByCurator(curatorId);
    } else if (status) {
      return this.missionService.getMissionsByStatus(status);
    }
    return this.missionService.getMissions();
  }

  @Get('curator/:curatorId')
  async getMissionsByCuratorId(@Param('curatorId') curatorId: string) {
    return this.missionService.getMissionsByCurator(curatorId);
  }

  @Get('status/:status')
  async getMissionsByStatus(@Param('status') status: MissionStatus) {
    return this.missionService.getMissionsByStatus(status);
  }

  @Delete(':id')
  async deleteMission(@Param('id') id: string) {
    return this.missionService.deleteMission(id);
  }
}
