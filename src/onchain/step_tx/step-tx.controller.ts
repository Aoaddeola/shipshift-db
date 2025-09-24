// src/step-tx/step-tx.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { StepTxService } from './step-tx.service.js';
import { StepTxCreateDto } from './step-tx-create.dto.js';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('step-tx')
export class StepTxController {
  constructor(private readonly stepTxService: StepTxService) {}

  @Post()
  async createStepTx(@Body() stepTx: StepTxCreateDto) {
    return this.stepTxService.createStepTx(stepTx);
  }

  @Get(':id')
  async getStepTx(@Param('id') id: string) {
    return this.stepTxService.getStepTx(id);
  }

  @Get()
  async getStepTxs() {
    return this.stepTxService.getStepTxs();
  }

  @Delete(':id')
  async deleteStepTx(@Param('id') id: string) {
    return this.stepTxService.deleteStepTx(id);
  }
}
