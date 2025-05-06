// src/operator/operator.controller.ts

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OperatorService } from './operator.service.js';
import { OperatorCreateDto } from './operator-create.dto.js';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Post()
  async createOperator(@Body() operator: OperatorCreateDto) {
    return this.operatorService.createOperator(operator);
  }

  @Get(':id')
  async getOperator(@Param('id') id: string) {
    return this.operatorService.getOperator(id);
  }

  @Get()
  async getOperators() {
    return this.operatorService.getOperators();
  }

  @Delete(':id')
  async deleteOperator(@Param('id') id: string) {
    return this.operatorService.deleteOperator(id);
  }
}
