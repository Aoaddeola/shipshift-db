import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Location } from './location.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { LocationCreateDto } from './location-create.dto.js';
import { LocationUpdateDto } from './location-update.dto.js';
import { UserService } from '../../users/user/user.service.js';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectDatabase('location') private database: Database<Location>,
    @Inject(UserService)
    private userService: UserService,
  ) {}

  async createLocation(
    location: Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'owner'>,
  ): Promise<Location> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating location: ${id}`);
    const newLocation: Location = {
      id,
      createdAt: now,
      updatedAt: now,
      ...location,
    };

    await this.database.put(newLocation);
    return newLocation;
  }

  async getLocation(id: string, include?: string[]): Promise<Location> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Location not found');
    }

    return this.populateRelations(entry, include);
  }

  async getLocations(
    filters: any = {},
    include?: string[],
  ): Promise<Location[]> {
    const all = await this.database.all();

    let filteredLocations = all;

    if (filters.ownerId) {
      filteredLocations = filteredLocations.filter(
        (location) => location.ownerId === filters.ownerId,
      );
    }

    if (filters.city) {
      filteredLocations = filteredLocations.filter(
        (location) => location.city === filters.city,
      );
    }

    if (filters.state) {
      filteredLocations = filteredLocations.filter(
        (location) => location.state === filters.state,
      );
    }

    if (filters.country) {
      filteredLocations = filteredLocations.filter(
        (location) => location.country === filters.country,
      );
    }

    return Promise.all(
      filteredLocations.map((location) =>
        this.populateRelations(location, include),
      ),
    );
  }

  async getLocationsByOwner(
    ownerId: string,
    include?: string[],
  ): Promise<Location[]> {
    const all = await this.database.all();
    const locations = all.filter((location) => location.ownerId === ownerId);

    return Promise.all(
      locations.map((location) => this.populateRelations(location, include)),
    );
  }

  async getLocationsByCity(
    city: string,
    include?: string[],
  ): Promise<Location[]> {
    const all = await this.database.all();
    const locations = all.filter((location) => location.city === city);

    return Promise.all(
      locations.map((location) => this.populateRelations(location, include)),
    );
  }

  async getLocationsByState(
    state: string,
    include?: string[],
  ): Promise<Location[]> {
    const all = await this.database.all();
    const locations = all.filter((location) => location.state === state);

    return Promise.all(
      locations.map((location) => this.populateRelations(location, include)),
    );
  }

  async getLocationsByCountry(
    country: string,
    include?: string[],
  ): Promise<Location[]> {
    const all = await this.database.all();
    const locations = all.filter((location) => location.country === country);

    return Promise.all(
      locations.map((location) => this.populateRelations(location, include)),
    );
  }

  private async populateRelations(
    location: Location,
    include?: string[],
  ): Promise<Location> {
    // Clone the location to avoid modifying the original
    const populatedLocation = { ...location };

    // Handle owner population
    if (include?.includes('owner')) {
      try {
        const owner = await this.userService.findById(location.ownerId);
        if (owner) {
          populatedLocation.owner = owner;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch owner for ${location.ownerId}`,
          error,
        );
      }
    }

    return populatedLocation;
  }

  async updateLocation(
    id: string,
    location: LocationCreateDto,
  ): Promise<Location> {
    // First check if location exists
    await this.getLocation(id);

    const now = new Date().toISOString();

    // Create updated location with ID preserved
    const updatedLocation: Location = {
      id,
      createdAt: now,
      updatedAt: now,
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
    const now = new Date().toISOString();

    // Handle nested coordinates update
    let updatedCoordinates = existingLocation.coordinates;
    if (update.coordinates) {
      updatedCoordinates = {
        ...existingLocation.coordinates,
        ...update.coordinates,
      };
    }

    // Create updated location by merging existing with update
    const updatedLocation = {
      ...existingLocation,
      ...update,
      coordinates: updatedCoordinates,
      updatedAt: now,
    };

    this.logger.log(`Partially updating location: ${id}`);
    await this.database.put(updatedLocation);
    return updatedLocation;
  }

  async deleteLocation(id: string): Promise<{ message: string }> {
    const location = await this.getLocation(id);
    await this.database.del(id);
    return {
      message: `Location "${location.name}" at ${location.street}, ${location.city} deleted successfully`,
    };
  }
}
