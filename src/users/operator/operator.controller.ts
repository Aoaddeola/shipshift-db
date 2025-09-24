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
} from '@nestjs/common';
import { OperatorService } from './operator.service.js';
import { OperatorCreateDto } from './operator-create.dto.js';
import { OperatorUpdateDto } from './operator-update.dto.js';

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

  @Put(':id')
  async updateOperator(
    @Param('id') id: string,
    @Body() operator: OperatorCreateDto,
  ) {
    return this.operatorService.updateOperator(id, operator);
  }

  @Patch(':id')
  async partialUpdateOperator(
    @Param('id') id: string,
    @Body() update: OperatorUpdateDto,
  ) {
    return this.operatorService.partialUpdateOperator(id, update);
  }

  @Get()
  async getOperators(
    @Query('contactDetailsId') contactDetailsId?: string,
    @Query('colonyNodeId') colonyNodeId?: string,
  ) {
    if (contactDetailsId && colonyNodeId) {
      return this.operatorService.getOperatorsByContactAndColonyNode(
        contactDetailsId,
        colonyNodeId,
      );
    } else if (contactDetailsId) {
      return this.operatorService.getOperatorsByContact(contactDetailsId);
    } else if (colonyNodeId) {
      return this.operatorService.getOperatorsByColonyNode(colonyNodeId);
    }
    return this.operatorService.getOperators();
  }

  @Get('address/:walletAddress')
  async getOperatorByAddress(@Param('walletAddress') walletAddress: string) {
    return this.operatorService.getOperatorByAddress(walletAddress);
  }

  @Get('contact/:contactDetailsId')
  async getOperatorsByContact(
    @Param('contactDetailsId') contactDetailsId: string,
  ) {
    return this.operatorService.getOperatorsByContact(contactDetailsId);
  }

  @Get('colony-node/:colonyNodeId')
  async getOperatorsByColonyNode(@Param('colonyNodeId') colonyNodeId: string) {
    return this.operatorService.getOperatorsByColonyNode(colonyNodeId);
  }

  @Delete(':id')
  async deleteOperator(@Param('id') id: string) {
    return this.operatorService.deleteOperator(id);
  }
}
