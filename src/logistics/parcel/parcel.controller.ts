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
import { ParcelService } from './parcel.service.js';
import { ParcelCreateDto } from './parcel-create.dto.js';
import { ParcelUpdateDto } from './parcel-update.dto.js';

@Controller('parcel')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Post()
  async createParcel(@Body() parcel: ParcelCreateDto) {
    return this.parcelService.createParcel(parcel);
  }

  @Get(':id')
  async getParcel(@Param('id') id: string, @Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.parcelService.getParcel(id, includeArray);
  }

  @Get()
  async getParcels(
    @Query('currencyId') currencyId?: string,
    @Query('fragile') fragile?: string,
    @Query('perishable') perishable?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const filters: any = {};

    if (currencyId) filters.currencyId = currencyId;
    if (fragile === 'true') filters.fragile = true;
    if (fragile === 'false') filters.fragile = false;
    if (perishable === 'true') filters.perishable = true;
    if (perishable === 'false') filters.perishable = false;

    return this.parcelService.getParcels(filters, includeArray);
  }

  @Get('currency/:currencyId')
  async getParcelsByCurrency(
    @Param('currencyId') currencyId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.parcelService.getParcelsByCurrency(currencyId, includeArray);
  }

  @Get('fragile')
  async getFragileParcels(@Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.parcelService.getFragileParcels(includeArray);
  }

  @Get('perishable')
  async getPerishableParcels(@Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.parcelService.getPerishableParcels(includeArray);
  }

  @Put(':id')
  async updateParcel(@Param('id') id: string, @Body() parcel: ParcelCreateDto) {
    return this.parcelService.updateParcel(id, parcel);
  }

  @Patch(':id')
  async partialUpdateParcel(
    @Param('id') id: string,
    @Body() update: ParcelUpdateDto,
  ) {
    return this.parcelService.partialUpdateParcel(id, update);
  }

  @Delete(':id')
  async deleteParcel(@Param('id') id: string) {
    return this.parcelService.deleteParcel(id);
  }
}
