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
  UsePipes,
  ValidationPipe,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LocationService } from './location.service.js';
import { LocationCreateDto } from './location-create.dto.js';
import { LocationUpdateDto } from './location-update.dto.js';
import { Coordinates, Location } from './location.types.js';
import { LocationProducer } from './producers/location.producer.js';

@ApiTags('locations')
@Controller('location')
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    @Inject(LocationProducer)
    private readonly locationProducer: LocationProducer,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new location' })
  async createLocation(@Body() location: LocationCreateDto) {
    return await this.locationService.createLocation(location);
  }

  @Get()
  @ApiOperation({ summary: 'Get locations with filters' })
  @ApiQuery({ name: 'ownerId', required: false })
  @ApiQuery({ name: 'city', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({
    name: 'include',
    required: false,
    description: 'Relations to include (e.g., owner)',
  })
  async getLocations(
    @Query('ownerId') ownerId?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('country') country?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const filters = { ownerId, city, state, country };

    const locations = await this.locationService.getLocations(
      filters,
      includeArray,
    );

    return {
      success: true,
      data: locations,
      count: locations.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('nearby')
  @ApiOperation({ summary: 'Find nearby locations' })
  async findNearbyLocations(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('radius') radius: number = 10,
    @Query('unit') unit: 'km' | 'miles' = 'km',
    @Query('limit') limit?: number,
    @Query('ownerId') ownerId?: string,
  ) {
    const coordinates: Coordinates = { latitude, longitude };

    // Use RPC for the calculation
    const response = await this.locationProducer.rpcFindNearbyLocations({
      coordinates,
      radius: unit === 'miles' ? radius * 1.60934 : radius, // Convert to km if miles
      limit,
      filters: ownerId ? { ownerId } : undefined,
    });

    return response;
  }

  @Get('distance/:id1/:id2')
  @ApiOperation({ summary: 'Calculate distance between two locations' })
  async calculateDistance(
    @Param('id1') locationId1: string,
    @Param('id2') locationId2: string,
    @Query('unit') unit: 'km' | 'miles' = 'km',
  ) {
    // Use RPC for the calculation
    const response = await this.locationProducer.rpcCalculateDistance(
      locationId1,
      locationId2,
      unit,
    );

    return response;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID' })
  async getLocation(
    @Param('id') id: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    const location = await this.locationService.getLocation(id, includeArray);

    return {
      success: true,
      data: location,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a location completely' })
  async updateLocation(
    @Param('id') id: string,
    @Body() location: LocationCreateDto,
    @Query('updatedBy') updatedBy?: string,
  ) {
    const result = await this.locationService.updateLocation(
      id,
      location,
      updatedBy,
    );

    return {
      success: true,
      data: result,
      message: 'Location updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a location' })
  async partialUpdateLocation(
    @Param('id') id: string,
    @Body() update: LocationUpdateDto,
    @Query('updatedBy') updatedBy?: string,
  ) {
    const result = await this.locationService.partialUpdateLocation(
      id,
      update,
      updatedBy,
    );

    return {
      success: true,
      data: result,
      message: 'Location partially updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a location' })
  async deleteLocation(
    @Param('id') id: string,
    @Query('deletedBy') deletedBy?: string,
    @Query('reason') reason?: string,
  ) {
    const result = await this.locationService.deleteLocation(
      id,
      deletedBy,
      reason,
    );

    return {
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('batch/update')
  @ApiOperation({ summary: 'Batch update locations' })
  async batchUpdateLocations(
    @Body()
    body: {
      filter: {
        ownerId?: string;
        city?: string;
        state?: string;
        country?: string;
      };
      update: LocationUpdateDto;
      requestedBy: string;
    },
  ) {
    const locations = await this.locationService.getLocations(body.filter);

    const updatedLocations: Location[] = [];
    for (const location of locations) {
      const updated = await this.locationService.partialUpdateLocation(
        location.id,
        body.update,
        body.requestedBy,
      );
      updatedLocations.push(updated);
    }

    // Publish batch update event
    await this.locationProducer.publishLocationsBatchUpdated(
      updatedLocations.length,
      body.filter,
      body.update,
      body.requestedBy,
    );

    return {
      success: true,
      data: updatedLocations,
      message: `Updated ${updatedLocations.length} locations`,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('validate/address')
  @ApiOperation({ summary: 'Validate an address' })
  async validateAddress(
    @Body()
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode?: number;
    },
  ) {
    const response = await this.locationProducer.rpcValidateAddress(address);

    return response;
  }

  @Post(':id/commands/calculate-distance')
  @ApiOperation({ summary: 'Send calculate distance command' })
  async sendCalculateDistanceCommand(
    @Param('id') locationId1: string,
    @Body()
    body: { locationId2: string; unit?: 'km' | 'miles'; requestedBy: string },
  ) {
    const success = await this.locationProducer.sendCalculateDistanceCommand(
      locationId1,
      body.locationId2,
      body.unit || 'km',
      body.requestedBy,
    );

    return {
      success,
      message: success
        ? 'Distance calculation command sent'
        : 'Failed to send command',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('commands/find-nearby')
  @ApiOperation({ summary: 'Send find nearby locations command' })
  async sendFindNearbyCommand(
    @Body()
    body: {
      coordinates: Coordinates;
      radius: number;
      filters?: any;
      requestedBy?: string;
    },
  ) {
    const success = await this.locationProducer.sendFindNearbyCommand(
      body.coordinates,
      body.radius,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      body.filters,
      body.requestedBy,
    );

    return {
      success,
      message: success ? 'Find nearby command sent' : 'Failed to send command',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('city/:city')
  async getLocationsByCity(@Param('city') city: string) {
    return this.locationService.getLocationsByCity(city);
  }

  @Get('owner/:ownerId')
  async getLocationsByOwner(@Param('ownerId') ownerId: string) {
    return this.locationService.getLocationsByOwner(ownerId);
  }

  @Get('state/:state')
  async getLocationsByState(@Param('state') state: string) {
    return this.locationService.getLocationsByState(state);
  }

  @Get('country/:country')
  async getLocationsByCountry(@Param('country') country: string) {
    return this.locationService.getLocationsByCountry(country);
  }
}
