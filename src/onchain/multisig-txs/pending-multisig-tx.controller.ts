// src/multi-sig-tx/pending-multisig-tx.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MultiSigTxService } from './pending-multisig-tx.service.js';
import { MultiSigTxCreateDto } from './pending-multisig-tx-create.dto.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('multi-sig-tx')
export class MultiSigTxController {
  constructor(private readonly multiSigTxService: MultiSigTxService) {}

  @Post()
  async createMultiSigTx(@Body() tx: MultiSigTxCreateDto) {
    return this.multiSigTxService.createMultiSigTx(tx);
  }

  @Get(':id')
  async getMultiSigTx(@Param('id') id: string) {
    return this.multiSigTxService.getMultiSigTx(id);
  }

  @Get()
  async getMultiSigTxs() {
    return this.multiSigTxService.getMultiSigTxs();
  }

  @Delete(':id')
  async deleteMultiSigTx(@Param('id') id: string) {
    return this.multiSigTxService.deleteMultiSigTx(id);
  }
}
