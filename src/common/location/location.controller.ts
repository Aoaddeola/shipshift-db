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
import { LocationService } from './location.service.js';
import { LocationCreateDto } from './location-create.dto.js';
import { LocationUpdateDto } from './location-update.dto.js';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async createLocation(@Body() location: LocationCreateDto) {
    return this.locationService.createLocation(location);
  }

  @Get(':id')
  async getLocation(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.locationService.getLocation(id, includeArray);
  }

  @Get()
  async getLocations(
    @Query('ownerId') ownerId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const filters: any = {};

    if (ownerId) filters.ownerId = ownerId;
    if (city) filters.city = city;
    if (state) filters.state = state;
    if (country) filters.country = country;

    return this.locationService.getLocations(filters, includeArray);
  }

  @Get('owner/:ownerId')
  async getLocationsByOwner(
    @Param('ownerId') ownerId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.locationService.getLocationsByOwner(ownerId, includeArray);
  }

  @Get('city/:city')
  async getLocationsByCity(
    @Param('city') city: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.locationService.getLocationsByCity(city, includeArray);
  }

  @Get('state/:state')
  async getLocationsByState(
    @Param('state') state: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.locationService.getLocationsByState(state, includeArray);
  }

  @Get('country/:country')
  async getLocationsByCountry(
    @Param('country') country: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.locationService.getLocationsByCountry(country, includeArray);
  }

  @Put(':id')
  async updateLocation(
    @Param('id') id: string,
    @Body() location: LocationCreateDto,
  ) {
    return this.locationService.updateLocation(id, location);
  }

  @Patch(':id')
  async partialUpdateLocation(
    @Param('id') id: string,
    @Body() update: LocationUpdateDto,
  ) {
    return this.locationService.partialUpdateLocation(id, update);
  }

  @Delete(':id')
  async deleteLocation(@Param('id') id: string) {
    return this.locationService.deleteLocation(id);
  }
}
