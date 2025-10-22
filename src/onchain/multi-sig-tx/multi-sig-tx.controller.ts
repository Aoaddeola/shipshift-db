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
import { MultiSigTxService } from './multi-sig-tx.service.js';
import { MultiSigTxCreateDto } from './multi-sig-tx-create.dto.js';
import { MultiSigTxUpdateDto } from './multi-sig-tx-update.dto.js';

@Controller('multi-sig-tx')
export class MultiSigTxController {
  constructor(private readonly multiSigTxService: MultiSigTxService) {}

  @Post()
  async createMultiSigTx(@Body() multiSigTx: MultiSigTxCreateDto) {
    return this.multiSigTxService.createMultiSigTx(multiSigTx);
  }

  @Get(':id')
  async getMultiSigTx(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.multiSigTxService.getMultiSigTx(id, includeArray);
  }

  @Get('txId/:txId')
  async getMultiSigTxByTxId(
    @Param('txId') txId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.multiSigTxService.getMultiSigTx(txId, includeArray);
  }

  @Get()
  async getMultiSigTxs(
    @Query('entityDbName') entityDbName?: string,
    @Query('entityId') entityId?: string,
    @Query('status') status?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const filters: any = {};

    if (entityDbName) filters.entityDbName = entityDbName;
    if (entityId) filters.entityId = entityId;
    if (status) filters.status = status;

    return this.multiSigTxService.getMultiSigTxs(filters, includeArray);
  }

  @Get('entity/:entityDbName/:entityId')
  async getMultiSigTxsByEntity(
    @Param('entityDbName') entityDbName: string,
    @Param('entityId') entityId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.multiSigTxService.getMultiSigTxsByEntity(
      entityDbName,
      entityId,
      includeArray,
    );
  }

  @Get('status/:status')
  async getMultiSigTxsByStatus(
    @Param('status') status: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.multiSigTxService.getMultiSigTxsByStatus(status, includeArray);
  }

  @Put(':id')
  async updateMultiSigTx(
    @Param('id') id: string,
    @Body() multiSigTx: MultiSigTxCreateDto,
  ) {
    return this.multiSigTxService.updateMultiSigTx(id, multiSigTx);
  }

  @Patch(':id')
  async partialUpdateMultiSigTx(
    @Param('id') id: string,
    @Body() update: MultiSigTxUpdateDto,
  ) {
    return this.multiSigTxService.partialUpdateMultiSigTx(id, update);
  }

  @Delete(':id')
  async deleteMultiSigTx(@Param('id') id: string) {
    return this.multiSigTxService.deleteMultiSigTx(id);
  }
}
