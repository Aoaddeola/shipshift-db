// src/availability/availability.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { OperatorAvailability } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AvailabilityService {
  private readonly logger = new Logger(AvailabilityService.name);

  constructor(
    @InjectDatabase('availability')
    private readonly database: Database<OperatorAvailability>,
  ) {}

  async createAvailability(
    availability: Omit<OperatorAvailability, 'id'>,
  ): Promise<OperatorAvailability> {
    const id = randomUUID();
    this.logger.log(`Creating availability: ${id}`);
    await this.database.put({ ...availability, id });
    return { id, ...availability };
  }

  async getAvailability(id: string): Promise<OperatorAvailability> {
    const availability = await this.database.get(id);
    if (!availability) {
      throw new NotFoundException('Availability not found');
    }
    return availability;
  }

  async getAvailabilities(): Promise<OperatorAvailability[]> {
    return this.database.all();
  }

  async deleteAvailability(id: string): Promise<{ message: string }> {
    const availability = await this.getAvailability(id);
    await this.database.del(id);
    return {
      message: `Availability for ${availability.walletAddress} deleted successfully`,
    };
  }
}
