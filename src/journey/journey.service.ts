// src/journey/journey.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { Journey } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(
    @InjectDatabase('journey') private database: Database<Journey>
  ) {}

  async createJourney(journey: Omit<Journey, 'id'>): Promise<Journey> {
    const id = randomUUID();
    this.logger.log(`Creating journey: ${id}`);
    await this.database.put({ ...journey, id });
    return { id, ...journey };
  }

  async getJourney(id: string): Promise<Journey> {
    const journey = await this.database.get(id);
    if (!journey) {
      throw new NotFoundException('Journey not found');
    }
    return journey;
  }

  async getJourneys(): Promise<Journey[]> {
    return this.database.all();
  }

  async deleteJourney(id: string): Promise<{ message: string }> {
    const journey = await this.getJourney(id);
    await this.database.del(id);
    return { message: `Journey from "${journey.start.availability.availableAs}" deleted successfully` };
  }
}