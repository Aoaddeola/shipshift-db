// src/step/step.controller.ts

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { StepService } from './step.service.js';
import { StepCreateDto } from './step-create.dto.js';

@Controller('step')
export class StepController {
  constructor(private readonly stepService: StepService) {}

  @Post()
  async createStep(@Body() step: StepCreateDto) {
    return this.stepService.createStep(step);
  }

  @Get(':id')
  async getStep(@Param('id') id: string) {
    return this.stepService.getStep(id);
  }

  @Get()
  async getSteps() {
    return this.stepService.getSteps();
  }

  @Delete(':id')
  async deleteStep(@Param('id') id: string) {
    return this.stepService.deleteStep(id);
  }
}
