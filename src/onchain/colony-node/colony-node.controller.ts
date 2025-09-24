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
import { ColonyNodeService } from './colony-node.service.js';
import { ColonyNodeCreateDto } from './colony-node-create.dto.js';
import { ColonyNodeUpdateDto } from './colony-node-update.dto.js';

@Controller('colony-node')
export class ColonyNodeController {
  constructor(private readonly colonyNodeService: ColonyNodeService) {}

  @Post()
  async createColonyNode(@Body() colonyNode: ColonyNodeCreateDto) {
    return this.colonyNodeService.createColonyNode(colonyNode);
  }

  @Get(':id')
  async getColonyNode(@Param('id') id: string) {
    return this.colonyNodeService.getColonyNode(id);
  }

  @Put(':id')
  async updateColonyNode(
    @Param('id') id: string,
    @Body() colonyNode: ColonyNodeCreateDto,
  ) {
    return this.colonyNodeService.updateColonyNode(id, colonyNode);
  }

  @Patch(':id')
  async partialUpdateColonyNode(
    @Param('id') id: string,
    @Body() update: ColonyNodeUpdateDto,
  ) {
    return this.colonyNodeService.partialUpdateColonyNode(id, update);
  }

  @Get()
  async getColonyNodes(
    @Query('peerId') peerId?: string,
    @Query('minSignatories') minSignatories?: number,
    @Query('maxSteps') maxSteps?: number,
  ) {
    if (peerId && minSignatories && maxSteps) {
      return this.colonyNodeService.getColonyNodesByAllFilters(
        peerId,
        minSignatories,
        maxSteps,
      );
    } else if (peerId && minSignatories) {
      return this.colonyNodeService.getColonyNodesByPeerIdAndMinSignatories(
        peerId,
        minSignatories,
      );
    } else if (peerId && maxSteps) {
      return this.colonyNodeService.getColonyNodesByPeerIdAndMaxSteps(
        peerId,
        maxSteps,
      );
    } else if (minSignatories && maxSteps) {
      return this.colonyNodeService.getColonyNodesByMinSignatoriesAndMaxSteps(
        minSignatories,
        maxSteps,
      );
    } else if (peerId) {
      return this.colonyNodeService.getColonyNodesByPeerId(peerId);
    } else if (minSignatories) {
      return this.colonyNodeService.getColonyNodesByMinSignatories(
        minSignatories,
      );
    } else if (maxSteps) {
      return this.colonyNodeService.getColonyNodesByMaxSteps(maxSteps);
    }
    return this.colonyNodeService.getColonyNodes();
  }

  @Get('peer/:peerId')
  async getColonyNodesByPeerId(@Param('peerId') peerId: string) {
    return this.colonyNodeService.getColonyNodesByPeerId(peerId);
  }

  @Get('operator/:operatorAddress')
  async getColonyNodesByOperatorAddress(
    @Param('operatorAddress') operatorAddress: string,
  ) {
    return this.colonyNodeService.getColonyNodesByOperatorAddress(
      operatorAddress,
    );
  }

  @Delete(':id')
  async deleteColonyNode(@Param('id') id: string) {
    return this.colonyNodeService.deleteColonyNode(id);
  }
}
