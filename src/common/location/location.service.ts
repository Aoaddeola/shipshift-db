import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Location } from './location.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { LocationCreateDto } from './location-create.dto.js';
import { LocationUpdateDto } from './location-update.dto.js';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectDatabase('location') private database: Database<Location>,
  ) {}

  async createLocation(location: Omit<Location, 'id'>): Promise<Location> {
    const id = randomUUID();
    this.logger.log(`Creating location: ${id}`);

    const newLocation: Location = {
      id,
      ...location,
    };

    await this.database.put(newLocation);
    return newLocation;
  }

  async getLocation(id: string): Promise<Location> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Location not found');
    }
    return entry;
  }

  async getLocations(): Promise<Location[]> {
    return this.database.all();
  }

  async getLocationsByCity(city: string): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter((location) => location.city === city);
  }

  async getLocationsByOwner(ownerId: string): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter((location) => location.ownerId === ownerId);
  }

  async getLocationsByState(state: string): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter((location) => location.state === state);
  }

  async getLocationsByCountry(country: string): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter((location) => location.country === country);
  }

  async getLocationsByPostalCode(postalCode: number): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter((location) => location.postalCode === postalCode);
  }

  async getLocationsByCityAndState(
    city: string,
    state: string,
  ): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter(
      (location) => location.city === city && location.state === state,
    );
  }

  async getLocationsByCityAndCountry(
    city: string,
    country: string,
  ): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter(
      (location) => location.city === city && location.country === country,
    );
  }

  async getLocationsByStateAndCountry(
    state: string,
    country: string,
  ): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter(
      (location) => location.state === state && location.country === country,
    );
  }

  async getLocationsByCityStateCountry(
    city: string,
    state: string,
    country: string,
  ): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter(
      (location) =>
        location.city === city &&
        location.state === state &&
        location.country === country,
    );
  }

  async getLocationsByAllFilters(
    city: string,
    state: string,
    country: string,
    postalCode: number,
  ): Promise<Location[]> {
    const all = await this.database.all();
    return all.filter(
      (location) =>
        location.city === city &&
        location.state === state &&
        location.country === country &&
        location.postalCode === postalCode,
    );
  }

  async updateLocation(
    id: string,
    location: LocationCreateDto,
  ): Promise<Location> {
    // First check if location exists
    await this.getLocation(id);

    const updatedLocation: Location = {
      id,
      ...location,
    };

    this.logger.log(`Updating location: ${id}`);
    await this.database.put(updatedLocation);
    return updatedLocation;
  }

  async partialUpdateLocation(
    id: string,
    update: LocationUpdateDto,
  ): Promise<Location> {
    const existingLocation = await this.getLocation(id);

    // Create updated location by merging existing with update
    const updatedLocation = {
      ...existingLocation,
      ...update,
    };

    this.logger.log(`Partially updating location: ${id}`);
    await this.database.put(updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<{ message: string }> {
    const location = await this.getLocation(id);
    await this.database.del(id);
    return {
      message: `Location "${location.street}, ${location.city}" deleted successfully`,
    };
  }
}
