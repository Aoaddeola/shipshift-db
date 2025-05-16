// src/colony/colony.controller.ts

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ColonyService } from './colony.service.js';
import { ColonyCreateDto } from './colony-create.dto.js';

@Controller('colony')
export class ColonyController {
  constructor(private readonly colonyService: ColonyService) {}

  @Post()
  async createColony(@Body() colony: ColonyCreateDto) {
    return this.colonyService.createColony(colony);
  }

  @Get(':id')
  async getColony(@Param('id') id: string) {
    return this.colonyService.getColony(id);
  }

  @Get()
  async getColonies() {
    return this.colonyService.getColonies();
  }

  @Delete(':id')
  async deleteColony(@Param('id') id: string) {
    return this.colonyService.deleteColony(id);
  }
}
