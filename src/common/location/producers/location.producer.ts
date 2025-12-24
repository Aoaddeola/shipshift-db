/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBusService } from '../../../shared/rabbitmq/rabbitmq.service.js';
import { Location, Coordinates } from '../location.types.js';
import { LocationUpdateDto } from '../location-update.dto.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';

export interface LocationCreatedEvent {
  locationId: string;
  ownerId: string;
  name: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
  createdAt: string;
  metadata?: {
    address: string;
    postalCode?: number;
  };
}

export interface LocationUpdatedEvent {
  locationId: string;
  ownerId: string;
  updatedFields: Partial<LocationUpdateDto>;
  previousValues?: Partial<Location>;
  updatedAt: string;
  changedBy?: string;
}

export interface LocationDeletedEvent {
  locationId: string;
  name: string;
  ownerId: string;
  address: string;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}

export interface LocationCoordinatesUpdatedEvent {
  locationId: string;
  previousCoordinates: Coordinates;
  newCoordinates: Coordinates;
  updatedAt: string;
  updatedBy: string;
  reason?: string;
}

export interface LocationOwnerChangedEvent {
  locationId: string;
  previousOwnerId: string;
  newOwnerId: string;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export interface CalculateDistanceRequest {
  locationId1: string;
  locationId2: string;
  unit?: 'km' | 'miles';
}

export interface CalculateDistanceResponse {
  distance: number;
  unit: 'km' | 'miles';
  location1: { name: string; coordinates: Coordinates };
  location2: { name: string; coordinates: Coordinates };
}

export interface FindNearbyRequest {
  coordinates: Coordinates;
  radius: number; // in kilometers
  limit?: number;
  filters?: {
    ownerId?: string;
    city?: string;
    country?: string;
    minDistance?: number;
  };
}

export interface NearbyLocation {
  locationId: string;
  name: string;
  address: string;
  distance: number;
  coordinates: Coordinates;
  ownerId?: string;
}

@Injectable()
export class LocationProducer {
  private readonly logger = new Logger(LocationProducer.name);
  private readonly config = RabbitMQConfig.LOCATION;

  constructor(
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  // ==================== EVENT PUBLISHING METHODS ====================

  async publishLocationCreated(location: Location): Promise<boolean> {
    const event: LocationCreatedEvent = {
      locationId: location.id,
      ownerId: location.ownerId,
      name: location.name,
      city: location.city,
      state: location.state,
      country: location.country,
      coordinates: location.coordinates,
      createdAt: location.createdAt || new Date().toISOString(),
      metadata: {
        address: `${location.street}, ${location.city}, ${location.state}`,
        postalCode: location.postalCode,
      },
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.CREATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'location',
          'x-event-type': 'created',
          'x-location-id': location.id,
          'x-owner-id': location.ownerId,
        },
      });

      this.logger.log(
        `Published ${this.config.EVENTS.CREATED} for location ${location.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.CREATED}:`,
        error,
      );
      return false;
    }
  }

  async publishLocationUpdated(
    locationId: string,
    previousValues: Partial<Location>,
    update: Partial<LocationUpdateDto>,
    changedBy?: string,
  ): Promise<boolean> {
    const event: LocationUpdatedEvent = {
      locationId,
      ownerId: update.ownerId || previousValues.ownerId || '',
      updatedFields: update,
      previousValues,
      updatedAt: new Date().toISOString(),
      changedBy,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'location',
          'x-event-type': 'updated',
          'x-location-id': locationId,
        },
      });

      // If coordinates were updated, publish a specific event
      if (update.coordinates && previousValues.coordinates) {
        await this.publishLocationCoordinatesUpdated(
          locationId,
          previousValues.coordinates,
          update.coordinates as Coordinates,
          changedBy || 'system',
        );
      }

      // If owner was updated, publish a specific event
      if (
        update.ownerId &&
        previousValues.ownerId &&
        update.ownerId !== previousValues.ownerId
      ) {
        await this.publishLocationOwnerChanged(
          locationId,
          previousValues.ownerId,
          update.ownerId,
          changedBy || 'system',
        );
      }

      this.logger.log(
        `Published ${this.config.EVENTS.UPDATED} for location ${locationId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishLocationDeleted(
    location: Location,
    deletedBy?: string,
    reason?: string,
  ): Promise<boolean> {
    const event: LocationDeletedEvent = {
      locationId: location.id,
      name: location.name,
      ownerId: location.ownerId,
      address: `${location.street}, ${location.city}`,
      deletedAt: new Date().toISOString(),
      deletedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.DELETED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'location',
          'x-event-type': 'deleted',
          'x-location-id': location.id,
        },
      });

      this.logger.log(
        `Published ${this.config.EVENTS.DELETED} for location ${location.id}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.DELETED}:`,
        error,
      );
      return false;
    }
  }

  async publishLocationCoordinatesUpdated(
    locationId: string,
    previousCoordinates: Coordinates,
    newCoordinates: Coordinates,
    updatedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: LocationCoordinatesUpdatedEvent = {
      locationId,
      previousCoordinates,
      newCoordinates,
      updatedAt: new Date().toISOString(),
      updatedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(
        this.config.EVENTS.COORDINATES_UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'location',
            'x-event-type': 'coordinates_updated',
            'x-location-id': locationId,
          },
        },
      );

      this.logger.log(
        `Published ${this.config.EVENTS.COORDINATES_UPDATED} for location ${locationId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.COORDINATES_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishLocationOwnerChanged(
    locationId: string,
    previousOwnerId: string,
    newOwnerId: string,
    changedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: LocationOwnerChangedEvent = {
      locationId,
      previousOwnerId,
      newOwnerId,
      changedAt: new Date().toISOString(),
      changedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.OWNER_CHANGED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'location',
          'x-event-type': 'owner_changed',
          'x-location-id': locationId,
        },
      });

      this.logger.log(
        `Published ${this.config.EVENTS.OWNER_CHANGED} for location ${locationId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.OWNER_CHANGED}:`,
        error,
      );
      return false;
    }
  }

  async publishLocationsBatchUpdated(
    updateCount: number,
    filterCriteria: {
      ownerId?: string;
      city?: string;
      state?: string;
      country?: string;
    },
    updatedFields: Partial<LocationUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event = {
      updateCount,
      filterCriteria,
      updatedFields,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.BATCH_UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'location',
          'x-event-type': 'batch_updated',
          'x-update-count': updateCount.toString(),
        },
      });

      this.logger.log(
        `Published ${this.config.EVENTS.BATCH_UPDATED} for ${updateCount} locations`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.BATCH_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  // ==================== COMMAND PUBLISHING METHODS ====================

  async sendCreateLocationCommand(
    locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'owner'>,
    createdBy?: string,
  ): Promise<boolean> {
    const command = {
      ...locationData,
      createdBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(this.config.COMMANDS.CREATE, command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}_location`,
        },
      });

      this.logger.log(`Sent ${this.config.COMMANDS.CREATE} command`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.CREATE}:`,
        error,
      );
      return false;
    }
  }

  async sendUpdateLocationCommand(
    locationId: string,
    update: Partial<LocationUpdateDto>,
    updatedBy: string,
  ): Promise<boolean> {
    const command = {
      locationId,
      update,
      updatedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(this.config.COMMANDS.UPDATE, command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}_${locationId}`,
          'x-location-id': locationId,
        },
      });

      this.logger.log(
        `Sent ${this.config.COMMANDS.UPDATE} command for location ${locationId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.UPDATE}:`,
        error,
      );
      return false;
    }
  }

  async sendCalculateDistanceCommand(
    locationId1: string,
    locationId2: string,
    unit: 'km' | 'miles' = 'km',
    requestedBy: string,
  ): Promise<boolean> {
    const command: CalculateDistanceRequest = {
      locationId1,
      locationId2,
      unit,
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.CALCULATE_DISTANCE,
        { ...command, requestedBy },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_distance`,
            'x-requested-by': requestedBy,
          },
        },
      );

      this.logger.log(
        `Sent ${this.config.COMMANDS.CALCULATE_DISTANCE} command`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.CALCULATE_DISTANCE}:`,
        error,
      );
      return false;
    }
  }

  async sendFindNearbyCommand(
    coordinates: Coordinates,
    radius: number,
    filters?: {
      ownerId?: string;
      city?: string;
      country?: string;
    },
    requestedBy?: string,
  ): Promise<boolean> {
    const command: FindNearbyRequest = {
      coordinates,
      radius,
      filters,
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.FIND_NEARBY,
        { ...command, requestedBy },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_nearby`,
          },
        },
      );

      this.logger.log(`Sent ${this.config.COMMANDS.FIND_NEARBY} command`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.FIND_NEARBY}:`,
        error,
      );
      return false;
    }
  }

  // ==================== RPC METHODS ====================

  async rpcGetLocation(locationId: string, include?: string[]): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET,
        { locationId, include },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${locationId}`,
            'x-location-id': locationId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.GET} failed:`, error);
      throw error;
    }
  }

  async rpcGetLocations(
    filters: {
      ownerId?: string;
      city?: string;
      state?: string;
      country?: string;
    },
    include?: string[],
    limit?: number,
    offset?: number,
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET_BATCH,
        { filters, include, limit, offset },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_locations`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.GET_BATCH} failed:`, error);
      throw error;
    }
  }

  async rpcCalculateDistance(
    locationId1: string,
    locationId2: string,
    unit: 'km' | 'miles' = 'km',
  ): Promise<CalculateDistanceResponse> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.CALCULATE_DISTANCE,
        { locationId1, locationId2, unit },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_distance`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.CALCULATE_DISTANCE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcFindNearbyLocations(
    request: FindNearbyRequest,
  ): Promise<NearbyLocation[]> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.FIND_NEARBY,
        request,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_nearby`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.FIND_NEARBY} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcValidateAddress(address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode?: number;
  }): Promise<{
    valid: boolean;
    coordinates?: Coordinates;
    normalizedAddress?: string;
    issues?: string[];
  }> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.VALIDATE_ADDRESS,
        { address },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_validate`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.VALIDATE_ADDRESS} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcCreateLocation(
    locationData: Omit<Location, 'id' | 'createdAt' | 'updatedAt' | 'owner'>,
    createdBy?: string,
  ): Promise<Location> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.CREATE,
        { locationData, createdBy },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_create`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.CREATE} failed:`, error);
      throw error;
    }
  }

  async rpcUpdateLocation(
    locationId: string,
    update: Partial<LocationUpdateDto>,
    updatedBy?: string,
  ): Promise<Location> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.UPDATE,
        { locationId, update, updatedBy },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${locationId}`,
            'x-location-id': locationId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.UPDATE} failed:`, error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  async calculateDistanceBetweenCoordinates(
    coord1: Coordinates,
    coord2: Coordinates,
    unit: 'km' | 'miles' = 'km',
  ): Promise<number> {
    const R = unit === 'km' ? 6371 : 3958.8; // Earth's radius in km or miles
    const dLat = this.degreesToRadians(coord2.latitude - coord1.latitude);
    const dLng = this.degreesToRadians(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(coord1.latitude)) *
        Math.cos(this.degreesToRadians(coord2.latitude)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async findLocationsWithinRadius(
    center: Coordinates,
    radius: number,
    locations: Location[],
    unit: 'km' | 'miles' = 'km',
  ): Promise<NearbyLocation[]> {
    const nearby: NearbyLocation[] = [];

    for (const location of locations) {
      const distance = await this.calculateDistanceBetweenCoordinates(
        center,
        location.coordinates,
        unit,
      );

      if (distance <= radius) {
        nearby.push({
          locationId: location.id,
          name: location.name,
          address: `${location.street}, ${location.city}`,
          distance: parseFloat(distance.toFixed(2)),
          coordinates: location.coordinates,
          ownerId: location.ownerId,
        });
      }
    }

    // Sort by distance
    return nearby.sort((a, b) => a.distance - b.distance);
  }
}
