import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OperatorService } from './operator.service.js';
import { OperatorCreateDto } from './operator-create.dto.js';
import { OperatorUpdateDto } from './operator-update.dto.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Post()
  async createOperator(@Body() operator: OperatorCreateDto) {
    return this.operatorService.createOperator(operator);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOperator(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.operatorService.getOperator(id, includeArray);
  }

  @UseGuards(JwtAuthGuard)
  @Get('address/:opAddr')
  async getOperatorByAddress(
    @Param('opAddr') opAddr: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.operatorService.getOperatorByAddress(opAddr, includeArray);
  }

  @UseGuards(JwtAuthGuard)
  @Get('colony-node/:colonyNodeId')
  async getOperatorsByColonyNode(
    @Param('colonyNodeId') colonyNodeId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.operatorService.getOperatorsByColonyNode(
      colonyNodeId,
      includeArray,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getOperators(
    @Query('colonyNodeId') colonyNodeId?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (colonyNodeId) {
      return this.operatorService.getOperatorsByColonyNode(
        colonyNodeId,
        includeArray,
      );
    }
    return this.operatorService.getOperators(includeArray);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateOperator(
    @Param('id') id: string,
    @Body() operator: OperatorCreateDto,
  ) {
    return this.operatorService.updateOperator(id, operator);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async partialUpdateOperator(
    @Param('id') id: string,
    @Body() update: OperatorUpdateDto,
  ) {
    return this.operatorService.partialUpdateOperator(id, update);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteOperator(@Param('id') id: string) {
    return this.operatorService.deleteOperator(id);
  }
}
