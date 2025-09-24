import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { JourneyCreateDto } from './journey-create.dto.js';
import { JourneyUpdateDto } from './journey-update.dto.js';
import { Journey, JourneyStatus } from './journey.types.js';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(@InjectDatabase('journey') private database: Database<Journey>) {}

  async createJourney(journey: Omit<Journey, 'id'>): Promise<Journey> {
    const id = randomUUID();
    this.logger.log(`Creating journey: ${id}`);

    // Handle default values
    const journeyWithDefaults = {
      status: JourneyStatus.AVAILABLE,
      ...journey,
      id,
    };

    await this.database.put(journeyWithDefaults);
    return journeyWithDefaults;
  }

  async getJourney(id: string): Promise<Journey> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Journey not found');
    }
    return entry;
  }

  async updateJourney(id: string, journey: JourneyCreateDto): Promise<Journey> {
    // First check if journey exists
    await this.getJourney(id);

    // Create updated journey with ID preserved
    const updatedJourney = {
      ...journey,
      id,
      status: JourneyStatus.AVAILABLE,
    };

    this.logger.log(`Updating journey: ${id}`);
    await this.database.put(updatedJourney);
    return updatedJourney;
  }

  async partialUpdateJourney(
    id: string,
    update: JourneyUpdateDto,
  ): Promise<Journey> {
    const existingJourney = await this.getJourney(id);

    // Create updated journey by merging existing with update
    const updatedJourney = {
      ...existingJourney,
      ...update,
    };

    this.logger.log(`Partially updating journey: ${id}`);
    await this.database.put(updatedJourney);
    return updatedJourney;
  }

  async getJourneys(): Promise<Journey[]> {
    return this.database.all();
  }

  async getJourneysByAgent(agentId: string): Promise<Journey[]> {
    const all = await this.database.all();
    return all.filter((journey) => journey.agentId === agentId);
  }

  async getJourneysFromLocation(fromLocationId: string): Promise<Journey[]> {
    const all = await this.database.all();
    return all.filter((journey) => journey.fromLocationId === fromLocationId);
  }

  async getJourneysToLocation(toLocationId: string): Promise<Journey[]> {
    const all = await this.database.all();
    return all.filter((journey) => journey.toLocationId === toLocationId);
  }

  async getJourneysByStatus(status: JourneyStatus): Promise<Journey[]> {
    const all = await this.database.all();
    return all.filter((journey) => journey.status === status);
  }

  async deleteJourney(id: string): Promise<{ message: string }> {
    const journey = await this.getJourney(id);
    await this.database.del(id);
    return {
      message: `Journey from ${journey.fromLocationId} to ${journey.toLocationId} deleted successfully`,
    };
  }
}
