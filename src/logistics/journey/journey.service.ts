/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { Journey, JourneyStatus } from './journey.types.js';
import { Database } from '../../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { JourneyCreateDto } from './journey-create.dto.js';
import { JourneyUpdateDto } from './journey-update.dto.js';
import { LocationService } from '../../common/location/location.service.js';
import { AgentService } from '../../profiles/agent/agent.service.js';

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

  async getJourneysByLocation(
    locationId: string,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.fromLocationId === locationId ||
        journey.toLocationId == locationId,
    );

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

  async getJourneysByFragile(
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) => journey.parcelHandlingInfo.fragile === fragile,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByPerishable(
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) => journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByHandling(
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

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

  async getJourneysByAgentAndFragile(
    agentId: string,
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        journey.parcelHandlingInfo.fragile === fragile,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentAndPerishable(
    agentId: string,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        journey.parcelHandlingInfo.perishable === perishable,
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

  async getJourneysByLocationAndFragile(
    locationId: string,
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.parcelHandlingInfo.fragile === fragile,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByLocationAndPerishable(
    locationId: string,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByStatusAndFragile(
    status: JourneyStatus,
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.status === status &&
        journey.parcelHandlingInfo.fragile === fragile,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByStatusAndPerishable(
    status: JourneyStatus,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.status === status &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByStatusAndHandling(
    status: JourneyStatus,
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.status === status &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
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

  async getJourneysByAgentLocationAndFragile(
    agentId: string,
    locationId: string,
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.parcelHandlingInfo.fragile === fragile,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentLocationAndPerishable(
    agentId: string,
    locationId: string,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentStatusAndFragile(
    agentId: string,
    status: JourneyStatus,
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        journey.status === status &&
        journey.parcelHandlingInfo.fragile === fragile,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentStatusAndPerishable(
    agentId: string,
    status: JourneyStatus,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        journey.status === status &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByLocationStatusAndFragile(
    locationId: string,
    status: JourneyStatus,
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.status === status &&
        journey.parcelHandlingInfo.fragile === fragile,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByLocationStatusAndPerishable(
    locationId: string,
    status: JourneyStatus,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.status === status &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentAndHandling(
    agentId: string,
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByLocationAndHandling(
    locationId: string,
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentLocationStatusAndPerishable(
    agentId: string,
    locationId: string,
    status: JourneyStatus,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.agentId === agentId &&
        journey.parcelHandlingInfo.perishable === perishable &&
        journey.status === status,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentLocationAndHandling(
    agentId: string,
    locationId: string,
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentLocationStatusAndFragile(
    agentId: string,
    locationId: string,
    status: JourneyStatus,
    fragile: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.status === status,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAgentStatusAndHandling(
    agentId: string,
    status: JourneyStatus,
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        journey.status === status &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByLocationStatusAndHandling(
    locationId: string,
    status: JourneyStatus,
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.status === status &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
    );

    return Promise.all(
      journeys.map((journey) => this.populateRelations(journey, include)),
    );
  }

  async getJourneysByAllFilters(
    agentId: string,
    locationId: string,
    status: JourneyStatus,
    fragile: boolean,
    perishable: boolean,
    include?: string[],
  ): Promise<Journey[]> {
    const all = await this.database.all();
    const journeys = all.filter(
      (journey) =>
        journey.agentId === agentId &&
        (journey.fromLocationId === locationId ||
          journey.toLocationId === locationId) &&
        journey.status === status &&
        journey.parcelHandlingInfo.fragile === fragile &&
        journey.parcelHandlingInfo.perishable === perishable,
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
        const agent = await this.agentService.getAgentsByOwner(journey.agentId);
        if (agent.length > 0) {
          populatedJourney.agent = agent[0];
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

    // Handle nested parcelHandlingInfo update
    let updatedParcelHandlingInfo = existingJourney.parcelHandlingInfo;
    if (update.parcelHandlingInfo) {
      updatedParcelHandlingInfo = {
        ...update.parcelHandlingInfo,
        ...existingJourney.parcelHandlingInfo,
      };
    }

    // Create updated journey by merging existing with update
    const updatedJourney = {
      ...existingJourney,
      ...update,
      parcelHandlingInfo: updatedParcelHandlingInfo,
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

  async updateJourneyStatus(
    id: string,
    newStatus: JourneyStatus,
    _changedBy: string,
    _metadata?: any,
  ): Promise<Journey> {
    const existingJourney = await this.getJourney(id);

    const update: any = {
      status: newStatus,
    };

    // If there are other fields to update based on status
    if (newStatus === JourneyStatus.COMPLETED) {
      update.completedAt = new Date().toISOString();
    } else if (newStatus === JourneyStatus.CANCELLED) {
      update.cancelledAt = new Date().toISOString();
    }

    // Use your existing updateJourney or partialUpdateJourney method
    // If you have a partial update method, use that:
    // return this.partialUpdateJourney(id, update, changedBy);

    // If you only have updateJourney, fetch the journey first
    const journeyToUpdate = {
      ...existingJourney,
      ...update,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    // Remove the id if your updateJourney doesn't expect it in the DTO
    const { id: _, ...journeyDto } = journeyToUpdate;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.updateJourney(id, journeyDto);
  }

  async validateBooking(
    journeyId: string,
    _bookerId: string,
    metadata?: any,
  ): Promise<{
    valid: boolean;
    reason?: string;
    capacity?: number;
    available?: boolean;
  }> {
    try {
      const journey = await this.getJourney(journeyId);

      // Check if journey is available for booking
      if (journey.status !== JourneyStatus.AVAILABLE) {
        return {
          valid: false,
          reason: `Journey is ${journey.status}, not available for booking`,
          capacity: journey.capacity,
          available: false,
        };
      }

      // Check capacity if required
      if (
        metadata?.requiredCapacity &&
        metadata.requiredCapacity > journey.capacity
      ) {
        return {
          valid: false,
          reason: `Insufficient capacity. Required: ${metadata.requiredCapacity}, Available: ${journey.capacity}`,
          capacity: journey.capacity,
          available: false,
        };
      }

      // Check availability window
      const now = new Date();
      const availableFrom = new Date(journey.availableFrom);
      const availableTo = new Date(journey.availableTo);

      if (now < availableFrom || now > availableTo) {
        return {
          valid: false,
          reason: `Journey not available at this time. Available from ${journey.availableFrom} to ${journey.availableTo}`,
          capacity: journey.capacity,
          available: false,
        };
      }

      return {
        valid: true,
        reason: 'Journey is available for booking',
        capacity: journey.capacity,
        available: true,
      };
    } catch (error) {
      this.logger.error(
        `Failed to validate booking for journey ${journeyId}:`,
        error,
      );
      return {
        valid: false,
        reason: `Validation failed: ${error.message}`,
        capacity: 0,
        available: false,
      };
    }
  }

  async notifyStakeholders(
    journeyId: string,
    _notificationType: string,
    _message: string,
    _sentBy: string,
  ): Promise<boolean> {
    try {
      const journey = await this.getJourney(journeyId);

      // Get stakeholders (agent, etc.)
      const stakeholders = [journey.agentId];

      // Send notification via RabbitMQ if you have a producer
      // await this.journeyProducer.sendNotifyStakeholdersCommand(
      //   journeyId,
      //   stakeholders,
      //   notificationType,
      //   message,
      //   sentBy
      // );

      this.logger.log(
        `Notified ${stakeholders.length} stakeholders for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to notify stakeholders for journey ${journeyId}:`,
        error,
      );
      return false;
    }
  }

  async assignAgent(
    journeyId: string,
    agentId: string,
    _assignedBy: string,
    _metadata?: any,
  ): Promise<Journey> {
    const journey = await this.getJourney(journeyId);

    const update = {
      agentId,
      updatedAt: new Date().toISOString(),
    };

    // Use your existing updateJourney method
    const { id: _, ...journeyDto } = {
      ...journey,
      ...update,
    };

    return this.updateJourney(journeyId, journeyDto);
  }

  async getJourneysByRoute(
    fromLocationId?: string,
    toLocationId?: string,
    status?: JourneyStatus,
    include?: string[],
  ): Promise<Journey[]> {
    const allJourneys = await this.getJourneys(include);
    return allJourneys.filter((journey) => {
      if (fromLocationId && journey.fromLocationId !== fromLocationId)
        return false;
      if (toLocationId && journey.toLocationId !== toLocationId) return false;
      if (status && journey.status !== status) return false;
      return true;
    });
  }

  // Alias for getJourneys
  async getAllJourneys(include?: string[]): Promise<Journey[]> {
    return this.getJourneys(include);
  }

  async findAvailableJourneys(filters: {
    fromLocationId?: string;
    toLocationId?: string;
    dateRange?: { from: string; to: string };
    minCapacity?: number;
    maxPrice?: number;
    agentId?: string;
  }): Promise<Journey[]> {
    const allJourneys = await this.getJourneys();

    return allJourneys.filter((journey) => {
      // Filter by status - must be AVAILABLE
      if (journey.status !== JourneyStatus.AVAILABLE) return false;

      // Filter by from location
      if (
        filters.fromLocationId &&
        journey.fromLocationId !== filters.fromLocationId
      )
        return false;

      // Filter by to location
      if (filters.toLocationId && journey.toLocationId !== filters.toLocationId)
        return false;

      // Filter by agent
      if (filters.agentId && journey.agentId !== filters.agentId) return false;

      // Filter by capacity
      if (filters.minCapacity && journey.capacity < filters.minCapacity)
        return false;

      // Filter by price
      if (filters.maxPrice && journey.price > filters.maxPrice) return false;

      // Filter by date range
      if (filters.dateRange) {
        const journeyFrom = new Date(journey.availableFrom);
        const journeyTo = new Date(journey.availableTo);
        const filterFrom = new Date(filters.dateRange.from);
        const filterTo = new Date(filters.dateRange.to);

        // Check if journey overlaps with filter date range
        if (journeyTo < filterFrom || journeyFrom > filterTo) return false;
      }

      return true;
    });
  }
}
