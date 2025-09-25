import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Journey, JourneyStatus } from './journey.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { JourneyCreateDto } from './journey-create.dto.js';
import { JourneyUpdateDto } from './journey-update.dto.js';
import { LocationService } from '../../common/location/location.service.js';
import { AgentService } from '../../users/agent/agent.service.js';

@Injectable()
export class JourneyService {
  private readonly logger = new Logger(JourneyService.name);

  constructor(
    @InjectDatabase('journey') private database: Database<Journey>,
    @Inject(AgentService) private agentService: AgentService,
    @Inject(LocationService) private locationService: LocationService,
  ) {}

  async createJourney(
    journey: Omit<
      Journey,
      'id' | 'createdAt' | 'updatedAt' | 'agent' | 'fromLocation' | 'toLocation'
    >,
  ): Promise<Journey> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating journey: ${id}`);
    const newJourney: Journey = {
      id,
      createdAt: now,
      updatedAt: now,
      status: journey.status || JourneyStatus.AVAILABLE,
      ...journey,
    };

    await this.database.put(newJourney);
    return newJourney;
  }

  async getJourney(id: string, include?: string[]): Promise<Journey> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Journey not found');
    }

    return this.populateRelations(entry, include);
  }

  async getJourneys(include?: string[]): Promise<Journey[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgent(
    agentId: string,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter((journey) => journey.agentId === agentId);

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysFromLocation(
    fromLocationId: string,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) => journey.fromLocationId === fromLocationId,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysToLocation(
    toLocationId: string,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) => journey.toLocationId === toLocationId,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByStatus(
    status: JourneyStatus,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter((journey) => journey.status === status);

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentAndLocation(
    agentId: string,
    locationId: string,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId),
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentAndStatus(
    agentId: string,
    status: JourneyStatus,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) => journey.agentId === agentId && journey.status === status,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByLocationAndStatus(
    locationId: string,
    status: JourneyStatus,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.status === status,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentLocationAndStatus(
    agentId: string,
    locationId: string,
    status: JourneyStatus,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.status === status,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  private async populateRelations(
    journey: Journey,
    include?: string[],
  ): Promise<Journey> {
    // Clone the journey to avoid modifying the original
    const populatedJourney = { ...journey };

    // Handle agent population
    if (include?.includes('agent')) {
      try {
        const agent = await this.agentService.getAgent(journey.agentId);
        if (agent) {
          populatedJourney.agent = agent;
        }
      } catch (error) {
        this.logger.warn(`Could not fetch agent for ${journey.agentId}`, error);
      }
    }

    // Handle fromLocation population
    if (include?.includes('fromLocation')) {
      try {
        const fromLocation = await this.locationService.getLocation(
          journey.fromLocationId,
        );
        if (fromLocation) {
          populatedJourney.fromLocation = fromLocation;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch from location for ${journey.fromLocationId}`,
          error,
        );
      }
    }

    // Handle toLocation population
    if (include?.includes('toLocation')) {
      try {
        const toLocation = await this.locationService.getLocation(
          journey.toLocationId,
        );
        if (toLocation) {
          populatedJourney.toLocation = toLocation;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch to location for ${journey.toLocationId}`,
          error,
        );
      }
    }

    return populatedJourney;
  }

  async updateJourney(id: string, journey: JourneyCreateDto): Promise<Journey> {
    // First check if journey exists
    await this.getJourney(id);

    const now = new Date().toISOString();

    // Create updated journey with ID preserved
    const updatedJourney: Journey = {
      id,
      createdAt: now,
      updatedAt: now,
      status: journey.status || JourneyStatus.AVAILABLE,
      ...journey,
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
    const now = new Date().toISOString();

    // Create updated journey by merging existing with update
    const updatedJourney = {
      ...existingJourney,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating journey: ${id}`);
    await this.database.put(updatedJourney);
    return updatedJourney;
  }

  async deleteJourney(id: string): Promise<{ message: string }> {
    const journey = await this.getJourney(id);
    await this.database.del(id);
    return {
      message: `Journey from ${journey.fromLocationId} to ${journey.toLocationId} deleted successfully`,
    };
  }
}
