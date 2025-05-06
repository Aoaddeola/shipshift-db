// src/colony/colony.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ColonyService } from './colony.service.js';
import { ColonyCreateDto } from './colony-create.dto.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('colony')
export class ColonyController {
  constructor(private readonly colonyService: ColonyService) {}

  @UseGuards(AuthGuard('jwt'))
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

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteColony(@Param('id') id: string) {
    return this.colonyService.deleteColony(id);
  }
}
