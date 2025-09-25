import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Location } from './location.types.js';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';

@Injectable()
export class LocationService {
  private readonly logger = new Logger(LocationService.name);

  constructor(
    @InjectDatabase('location') private database: Database<Location>,
  ) {}

  async createLocation(location: Omit<Location, 'id'>): Promise<Location> {
    const id = randomUUID();
    this.logger.log(`Creating location: ${id}`);
    await this.database.put({ ...location, id });
    return { id, ...location };
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

  async deleteLocation(id: string): Promise<{ message: string }> {
    const location = await this.getLocation(id);
    await this.database.del(id);
    return {
      message: `Location "\${location.street}, ${location.city}" deleted successfully`,
    };
  }
}
