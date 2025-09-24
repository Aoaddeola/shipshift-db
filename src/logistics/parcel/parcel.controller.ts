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
import { ParcelCreateDto } from './parcel-create.dto.js';
import { ParcelUpdateDto } from './parcel-update.dto.js';
import { ParcelService } from './parcel.service.js';

@Controller('parcel')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Post()
  async createParcel(@Body() parcel: ParcelCreateDto) {
    return this.parcelService.createParcel(parcel);
  }

  @Get(':id')
  async getParcel(@Param('id') id: string) {
    return this.parcelService.getParcel(id);
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

  @Get()
  async getParcels() {
    return this.parcelService.getParcels();
  }

  @Get('search')
  async searchParcels(
    @Query('name') name?: string,
    @Query('description') description?: string,
  ) {
    if (name && description) {
      return this.parcelService.searchParcelsByNameAndDescription(
        name,
        description,
      );
    } else if (name) {
      return this.parcelService.searchParcelsByName(name);
    } else if (description) {
      return this.parcelService.searchParcelsByDescription(description);
    }
    return this.parcelService.getParcels();
  }

  @Delete(':id')
  async deleteParcel(@Param('id') id: string) {
    return this.parcelService.deleteParcel(id);
  }
}
