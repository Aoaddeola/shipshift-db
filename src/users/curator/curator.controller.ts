import { Body, Controller, Delete, Get, Param, Post, Put, Patch, Query } from '@nestjs/common';
import { CuratorService } from './curator.service.js';
import { CuratorCreateDto } from './curator-create.dto.js';
import { CuratorUpdateDto } from './curator-update.dto.js';

@Controller('curator')
export class CuratorController {
  constructor(private readonly curatorService: CuratorService) {}

  @Post()
  async createCurator(@Body() curator: CuratorCreateDto) {
    return this.curatorService.createCurator(curator);
  }

  @Get(':id')
  async getCurator(@Param('id') id: string) {
    return this.curatorService.getCurator(id);
  }

  @Put(':id')
  async updateCurator(
    @Param('id') id: string,
    @Body() curator: CuratorCreateDto
  ) {
    return this.curatorService.updateCurator(id, curator);
  }

  @Patch(':id')
  async partialUpdateCurator(
    @Param('id') id: string,
    @Body() update: CuratorUpdateDto
  ) {
    return this.curatorService.partialUpdateCurator(id, update);
  }

  @Get()
  async getCurators(
    @Query('contactDetailsId') contactDetailsId?: string,
    @Query('missionId') missionId?: string
  ) {
    if (contactDetailsId && missionId) {
      return this.curatorService.getCuratorsByContactAndMission(contactDetailsId, missionId);
    } else if (contactDetailsId) {
      return this.curatorService.getCuratorsByContact(contactDetailsId);
    } else if (missionId) {
      return this.curatorService.getCuratorsByMission(missionId);
    }
    return this.curatorService.getCurators();
  }

  @Get('contact/:contactDetailsId')
  async getCuratorsByContact(@Param('contactDetailsId') contactDetailsId: string) {
    return this.curatorService.getCuratorsByContact(contactDetailsId);
  }

  @Get('mission/:missionId')
  async getCuratorsByMission(@Param('missionId') missionId: string) {
    return this.curatorService.getCuratorsByMission(missionId);
  }

  @Delete(':id')
  async deleteCurator(@Param('id') id: string) {
    return this.curatorService.deleteCurator(id);
  }
}
