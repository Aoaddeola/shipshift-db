// src/step-tx/step-tx.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Query,
} from '@nestjs/common';
import { StepTxService } from './step-tx.service.js';
import { StepTxCreateDto } from './step-tx-create.dto.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';
import { StepService } from '../step/step.service.js';

@Controller('step-tx')
export class StepTxController {
  constructor(
    private readonly stepTxService: StepTxService,
    private readonly stepService: StepService,
  ) {}

  @UseGuards(JwtAuthGuard)
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

  // New endpoints for filtering
  @Get('state/:state')
  async getStepTxsByState(@Param('state') state: number) {
    return this.stepTxService.getStepTxsByState(state);
  }

  @Get('transaction/:transactionHash')
  async getStepTxsByTransactionHash(
    @Param('transactionHash') transactionHash: string,
  ) {
    return this.stepTxService.getStepTxsByTransactionHash(transactionHash);
  }

  @Get('step/:stepId')
  async getStepTxsByStepId(@Param('stepId') stepId: string) {
    return this.stepTxService.getStepTxsByStepId(stepId);
  }

  @Get('filter/state-transaction')
  async getStepTxsByStateAndTransactionHash(
    @Query('state') state: number,
    @Query('transactionHash') transactionHash: string,
  ) {
    return this.stepTxService.getStepTxsByStateAndTransactionHash(
      state,
      transactionHash,
    );
  }

  @Get('filter/state-step')
  async getStepTxsByStateAndStepId(
    @Query('state') state: number,
    @Query('stepId') stepId: string,
  ) {
    return this.stepTxService.getStepTxsByStateAndStepId(state, stepId);
  }

  @Get('filter/transaction-step')
  async getStepTxsByTransactionHashAndStepId(
    @Query('transactionHash') transactionHash: string,
    @Query('stepId') stepId: string,
  ) {
    return this.stepTxService.getStepTxsByTransactionHashAndStepId(
      transactionHash,
      stepId,
    );
  }

  @Get('filter/all')
  async getStepTxsByAllFilters(
    @Query('state') state: number,
    @Query('transactionHash') transactionHash: string,
    @Query('stepId') stepId: string,
  ) {
    return this.stepTxService.getStepTxsByAllFilters(
      state,
      transactionHash,
      stepId,
    );
  }
}
