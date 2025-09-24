// src/pending-multisig-tx-witness/pending-multisig-tx-witness.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MultiSigWitnessService } from './pending-multisig-tx-witness.service.js';
import { MultiSigWitnessCreateDto } from './pending-multisig-tx-witness-create.dto.js';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('pending-multisig-tx-witness')
export class MultiSigWitnessController {
  constructor(
    private readonly multiSigWitnessService: MultiSigWitnessService,
  ) {}

  @Post()
  async createMultiSigWitness(@Body() witness: MultiSigWitnessCreateDto) {
    return this.multiSigWitnessService.createMultiSigWitness(witness);
  }

  @Get(':id')
  async getMultiSigWitness(@Param('id') id: string) {
    return this.multiSigWitnessService.getMultiSigWitness(id);
  }

  @Get()
  async getMultiSigWitnesses() {
    return this.multiSigWitnessService.getMultiSigWitnesses();
  }

  @Delete(':id')
  async deleteMultiSigWitness(@Param('id') id: string) {
    return this.multiSigWitnessService.deleteMultiSigWitness(id);
  }
}
