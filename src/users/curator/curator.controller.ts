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
import { CuratorService } from './curator.service.js';
import { CuratorCreateDto } from './curator-create.dto.js';
import { CuratorUpdateDto } from './curator-update.dto.js';

@Controller('curator')
export class CuratorController {
  constructor(private readonly curatorService: CuratorService) {}

  @Post()
  async createCurator(@Body() curator: CuratorCreateDto) {
    return this.curatorService.createCurator(curator);
  }

  @Get(':id')
  async getCurator(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.curatorService.getCurator(id, includeArray);
  }

  @Get()
  async getCurators(
    @Query('contactDetailsId') contactDetailsId?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (contactDetailsId) {
      return this.curatorService.getCuratorsByContactDetails(
        contactDetailsId,
        includeArray,
      );
    }
    return this.curatorService.getCurators(includeArray);
  }

  @Get('contact/:contactDetailsId')
  async getCuratorsByContactDetails(
    @Param('contactDetailsId') contactDetailsId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.curatorService.getCuratorsByContactDetails(
      contactDetailsId,
      includeArray,
    );
  }

  @Put(':id')
  async updateCurator(
    @Param('id') id: string,
    @Body() curator: CuratorCreateDto,
  ) {
    return this.curatorService.updateCurator(id, curator);
  }

  @Patch(':id')
  async partialUpdateCurator(
    @Param('id') id: string,
    @Body() update: CuratorUpdateDto,
  ) {
    return this.curatorService.partialUpdateCurator(id, update);
  }

  @Delete(':id')
  async deleteCurator(@Param('id') id: string) {
    return this.curatorService.deleteCurator(id);
  }
}
