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
import { OperatorCreateDto } from './operator-create.dto.js';
import { OperatorUpdateDto } from './operator-update.dto.js';
import { OperatorService } from './operator.service.js';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Post()
  async createOperator(@Body() operator: OperatorCreateDto) {
    return this.operatorService.createOperator(operator);
  }

  @Get(':id')
  async getOperator(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.operatorService.getOperator(id, includeArray);
  }

  @Get('address/:walletAddress')
  async getOperatorByAddress(
    @Param('walletAddress') walletAddress: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.operatorService.getOperatorByAddress(
      walletAddress,
      includeArray,
    );
  }

  @Get('contact/:contactDetailsId')
  async getOperatorsByContact(
    @Param('contactDetailsId') contactDetailsId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.operatorService.getOperatorsByContact(
      contactDetailsId,
      includeArray,
    );
  }

  @Get()
  async getOperators(@Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.operatorService.getOperators(includeArray);
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

  @Delete(':id')
  async deleteOperator(@Param('id') id: string) {
    return this.operatorService.deleteOperator(id);
  }
}
