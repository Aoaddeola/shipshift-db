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
import { OperatorBadgeService } from './operator-badge.service.js';
import { OperatorBadgeCreateDto } from './operator-badge-create.dto.js';
import { OperatorBadgeUpdateDto } from './operator-badge-update.dto.js';

@Controller('operator-badge')
export class OperatorBadgeController {
  constructor(private readonly operatorBadgeService: OperatorBadgeService) {}

  @Post()
  async createOperatorBadge(@Body() operatorBadge: OperatorBadgeCreateDto) {
    return this.operatorBadgeService.createOperatorBadge(operatorBadge);
  }

  @Get(':id')
  async getOperatorBadge(@Param('id') id: string) {
    return this.operatorBadgeService.getOperatorBadge(id);
  }

  @Put(':id')
  async updateOperatorBadge(
    @Param('id') id: string,
    @Body() operatorBadge: OperatorBadgeCreateDto,
  ) {
    return this.operatorBadgeService.updateOperatorBadge(id, operatorBadge);
  }

  @Patch(':id')
  async partialUpdateOperatorBadge(
    @Param('id') id: string,
    @Body() update: OperatorBadgeUpdateDto,
  ) {
    return this.operatorBadgeService.partialUpdateOperatorBadge(id, update);
  }

  @Get()
  async getOperatorBadges(
    @Query('stepAddress') stepAddress?: string,
    @Query('policyId') policyId?: string,
  ) {
    if (stepAddress && policyId) {
      return this.operatorBadgeService.getOperatorBadgesByStepAddressAndPolicy(
        stepAddress,
        policyId,
      );
    } else if (stepAddress) {
      return this.operatorBadgeService.getOperatorBadgesByStepAddress(
        stepAddress,
      );
    } else if (policyId) {
      return this.operatorBadgeService.getOperatorBadgesByPolicy(policyId);
    }
    return this.operatorBadgeService.getOperatorBadges();
  }

  @Get('step-address/:stepAddress')
  async getOperatorBadgesByStepAddress(
    @Param('stepAddress') stepAddress: string,
  ) {
    return this.operatorBadgeService.getOperatorBadgesByStepAddress(
      stepAddress,
    );
  }

  @Get('policy/:policyId')
  async getOperatorBadgesByPolicy(@Param('policyId') policyId: string) {
    return this.operatorBadgeService.getOperatorBadgesByPolicy(policyId);
  }

  @Delete(':id')
  async deleteOperatorBadge(@Param('id') id: string) {
    return this.operatorBadgeService.deleteOperatorBadge(id);
  }
}
