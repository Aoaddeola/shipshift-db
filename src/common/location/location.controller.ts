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
import { LocationService } from './location.service.js';
import { LocationCreateDto } from './location-create.dto.js';
import { LocationUpdateDto } from './location-update.dto.js';

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
  async getLocations(
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('postalCode') postalCode?: number,
  ) {
    if (city && state && country && postalCode) {
      return this.locationService.getLocationsByAllFilters(
        city,
        state,
        country,
        postalCode,
      );
    } else if (city && state && country) {
      return this.locationService.getLocationsByCityStateCountry(
        city,
        state,
        country,
      );
    } else if (city && state) {
      return this.locationService.getLocationsByCityAndState(city, state);
    } else if (city && country) {
      return this.locationService.getLocationsByCityAndCountry(city, country);
    } else if (state && country) {
      return this.locationService.getLocationsByStateAndCountry(state, country);
    } else if (city) {
      return this.locationService.getLocationsByCity(city);
    } else if (state) {
      return this.locationService.getLocationsByState(state);
    } else if (country) {
      return this.locationService.getLocationsByCountry(country);
    } else if (postalCode) {
      return this.locationService.getLocationsByPostalCode(postalCode);
    }
    return this.locationService.getLocations();
  }

  @Get('city/:city')
  async getLocationsByCity(@Param('city') city: string) {
    return this.locationService.getLocationsByCity(city);
  }

  @Get('state/:state')
  async getLocationsByState(@Param('state') state: string) {
    return this.locationService.getLocationsByState(state);
  }

  @Get('country/:country')
  async getLocationsByCountry(@Param('country') country: string) {
    return this.locationService.getLocationsByCountry(country);
  }

  @Get('postal-code/:postalCode')
  async getLocationsByPostalCode(@Param('postalCode') postalCode: number) {
    return this.locationService.getLocationsByPostalCode(postalCode);
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
