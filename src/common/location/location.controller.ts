import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { LocationCreateDto } from './location-create.dto.js';
import { LocationService } from './location.service.js';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async createLocation(@Body() location: LocationCreateDto) {
    return this.locationService.createLocation(location);
  }

  @Get(':id')
  async getLocation(@Param('id') id: string) {
    return this.locationService.getLocation(id);
  }

  @Get()
  async getLocations() {
    return this.locationService.getLocations();
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: string) {
    return this.locationService.deleteLocation(id);
  }
}
