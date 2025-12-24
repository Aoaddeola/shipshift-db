/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { LocationService } from '../location.service.js';
import { calculateDistanceBetweenCoordinates } from '../location.service.js';
import { Coordinates } from '../location.types.js';
import { LocationProducer } from '../producers/location.producer.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';

@Injectable()
export class LocationConsumer {
  private readonly logger = new Logger(LocationConsumer.name);

  constructor(
    @Inject(LocationService)
    private readonly locationService: LocationService,
    @Inject(LocationProducer)
    private readonly locationProducer: LocationProducer,
  ) {}

  // ==================== COMMAND HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.LOCATION.COMMANDS.CREATE,
    queue: RabbitMQConfig.LOCATION.QUEUES.COMMAND_CREATE,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.LOCATION.QUEUES.COMMAND_CREATE,
    ),
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('LocationConsumer-CreateCommand');
      logger.error(
        `Failed to process ${RabbitMQConfig.LOCATION.COMMANDS.CREATE}:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleCreateLocationCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.LOCATION.COMMANDS.CREATE} command`,
    );

    try {
      // Extract location data from command
      //   const { createdBy, timestamp, ...locationData } = command;

      // Create the location
      const location = await this.locationService.createLocation(command.data);

      // Publish creation event
      await this.locationProducer.publishLocationCreated(location);

      this.logger.log(`Successfully created location: ${location.id}`);
    } catch (error) {
      this.logger.error(`Failed to create location from command:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.LOCATION.COMMANDS.UPDATE,
    queue: RabbitMQConfig.LOCATION.QUEUES.COMMAND_UPDATE,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.LOCATION.QUEUES.COMMAND_UPDATE,
    ),
  })
  async handleUpdateLocationCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.LOCATION.COMMANDS.UPDATE} for location ${command.locationId}`,
    );

    try {
      const { locationId, update, updatedBy } = command;

      // Get existing location for comparison
      const existingLocation =
        await this.locationService.getLocation(locationId);

      // Update the location
      await this.locationService.partialUpdateLocation(locationId, update);

      // Publish update event
      await this.locationProducer.publishLocationUpdated(
        locationId,
        existingLocation,
        update,
        updatedBy,
      );

      this.logger.log(`Successfully updated location: ${locationId}`);
    } catch (error) {
      this.logger.error(`Failed to update location from command:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.LOCATION.COMMANDS.CALCULATE_DISTANCE,
    queue: 'locations.command.calculate.distance.queue',
  })
  async handleCalculateDistanceCommand(command: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.LOCATION.COMMANDS.CALCULATE_DISTANCE} command`,
    );

    try {
      const { locationId1, locationId2, unit } = command;

      // Get both locations
      const location1 = await this.locationService.getLocation(locationId1);
      const location2 = await this.locationService.getLocation(locationId2);

      // Calculate distance
      const distance = calculateDistanceBetweenCoordinates(
        location1.coordinates,
        location2.coordinates,
      );

      // Convert units if needed
      const finalDistance = unit === 'miles' ? distance * 0.621371 : distance;

      this.logger.log(
        `Distance between ${locationId1} and ${locationId2}: ${finalDistance.toFixed(2)} ${unit}`,
      );

      // You could publish a notification or store the calculation result
    } catch (error) {
      this.logger.error(`Failed to calculate distance:`, error);
      throw error;
    }
  }

  // ==================== RPC HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.LOCATION.RPC.GET,
    queue: RabbitMQConfig.LOCATION.QUEUES.RPC_GET,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetLocationRPC(request: {
    locationId: string;
    include?: string[];
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.LOCATION.RPC.GET} for location ${request.locationId}`,
    );

    try {
      const location = await this.locationService.getLocation(
        request.locationId,
        request.include,
      );

      return {
        success: true,
        data: location,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.LOCATION.RPC.GET} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        errorCode: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.LOCATION.RPC.GET_BATCH,
    queue: 'locations.rpc.get.batch.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetLocationsRPC(request: {
    filters: any;
    include?: string[];
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.LOCATION.RPC.GET_BATCH} with filters`,
      request.filters,
    );

    try {
      const locations = await this.locationService.getLocations(
        request.filters,
        request.include,
      );

      // Apply pagination
      let result = locations;
      if (request.limit || request.offset) {
        const offset = request.offset || 0;
        const limit = request.limit || locations.length;
        result = locations.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: result,
        count: result.length,
        total: locations.length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.LOCATION.RPC.GET_BATCH} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.LOCATION.RPC.CALCULATE_DISTANCE,
    queue: 'locations.rpc.calculate.distance.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleCalculateDistanceRPC(request: {
    locationId1: string;
    locationId2: string;
    unit?: 'km' | 'miles';
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.LOCATION.RPC.CALCULATE_DISTANCE} between ${request.locationId1} and ${request.locationId2}`,
    );

    try {
      // Get both locations
      const location1 = await this.locationService.getLocation(
        request.locationId1,
      );
      const location2 = await this.locationService.getLocation(
        request.locationId2,
      );

      // Calculate distance in kilometers
      const distanceKm = calculateDistanceBetweenCoordinates(
        location1.coordinates,
        location2.coordinates,
      );

      // Convert to requested unit
      const unit = request.unit || 'km';
      const distance = unit === 'miles' ? distanceKm * 0.621371 : distanceKm;

      return {
        success: true,
        data: {
          distance: parseFloat(distance.toFixed(2)),
          unit,
          location1: {
            name: location1.name,
            coordinates: location1.coordinates,
            address: `${location1.street}, ${location1.city}`,
          },
          location2: {
            name: location2.name,
            coordinates: location2.coordinates,
            address: `${location2.street}, ${location2.city}`,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.LOCATION.RPC.CALCULATE_DISTANCE} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.LOCATION.RPC.FIND_NEARBY,
    queue: RabbitMQConfig.LOCATION.QUEUES.RPC_FIND_NEARBY,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleFindNearbyRPC(request: {
    coordinates: Coordinates;
    radius: number;
    limit?: number;
    filters?: {
      ownerId?: string;
      city?: string;
      country?: string;
      minDistance?: number;
    };
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.LOCATION.RPC.FIND_NEARBY} near coordinates`,
      request.coordinates,
    );

    try {
      // Get all locations
      const allLocations = await this.locationService.getLocations(
        request.filters || {},
      );

      // Filter by distance using the imported function
      const nearbyLocations = allLocations
        .map((location) => {
          const distance = calculateDistanceBetweenCoordinates(
            request.coordinates,
            location.coordinates,
          );
          return { location, distance };
        })
        .filter((item) => item.distance <= request.radius)
        .filter(
          (item) =>
            !request.filters?.minDistance ||
            item.distance >= (request.filters.minDistance || 0),
        )
        .sort((a, b) => a.distance - b.distance)
        .slice(0, request.limit || 10)
        .map((item) => ({
          locationId: item.location.id,
          name: item.location.name,
          address: `${item.location.street}, ${item.location.city}`,
          distance: parseFloat(item.distance.toFixed(2)),
          coordinates: item.location.coordinates,
          ownerId: item.location.ownerId,
        }));

      return {
        success: true,
        data: nearbyLocations,
        count: nearbyLocations.length,
        searchRadius: request.radius,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.LOCATION.RPC.FIND_NEARBY} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.LOCATION.RPC.CREATE,
    queue: RabbitMQConfig.LOCATION.QUEUES.RPC_CREATE,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleCreateLocationRPC(request: {
    locationData: any;
    createdBy?: string;
  }) {
    this.logger.log(`RPC: ${RabbitMQConfig.LOCATION.RPC.CREATE}`);

    try {
      const location = await this.locationService.createLocation(
        request.locationData,
      );

      // Publish creation event
      await this.locationProducer.publishLocationCreated(location);

      return {
        success: true,
        data: location,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.LOCATION.RPC.CREATE} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.LOCATION.RPC.VALIDATE_ADDRESS,
    queue: 'locations.rpc.validate.address.queue',
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleValidateAddressRPC(request: {
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      postalCode?: number;
    };
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.LOCATION.RPC.VALIDATE_ADDRESS} for ${request.address.street}`,
    );

    try {
      // Simple validation - in production, you would use a geocoding service
      const isValid =
        request.address.street &&
        request.address.city &&
        request.address.state &&
        request.address.country &&
        request.address.street.length > 2 &&
        request.address.city.length > 1;

      if (!isValid) {
        return {
          success: true,
          data: {
            valid: false,
            issues: ['Address appears to be incomplete or invalid'],
            normalizedAddress: null,
            coordinates: null,
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Mock coordinates - in production, use a geocoding service
      const mockCoordinates: Coordinates = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
      };

      return {
        success: true,
        data: {
          valid: true,
          issues: [],
          normalizedAddress: `${request.address.street}, ${request.address.city}, ${request.address.state}, ${request.address.country}`,
          coordinates: mockCoordinates,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.LOCATION.RPC.VALIDATE_ADDRESS} failed:`,
        error,
      );

      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== INTEGRATION EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'user.updated',
    queue: RabbitMQConfig.LOCATION.QUEUES.USER_EVENTS,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.LOCATION.QUEUES.USER_EVENTS,
    ),
  })
  async handleUserUpdated(event: any) {
    this.logger.log(`Processing user.updated event for user ${event.userId}`);

    try {
      // If user's location-related info changed (e.g., address), we might need to update locations
      // This is a placeholder for actual business logic
      if (event.updatedFields?.address || event.updatedFields?.city) {
        // Get all locations owned by this user
        const userLocations = await this.locationService.getLocationsByOwner(
          event.userId,
        );

        this.logger.log(
          `User ${event.userId} updated, affecting ${userLocations.length} locations`,
        );

        // You could update location metadata or trigger recalculations here
      }
    } catch (error) {
      this.logger.error(`Failed to process user.updated event:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: 'user.deleted',
    queue: 'locations.integration.user.deleted.queue',
  })
  async handleUserDeleted(event: any) {
    this.logger.log(`Processing user.deleted event for user ${event.userId}`);

    try {
      // Get all locations owned by this user
      const userLocations = await this.locationService.getLocationsByOwner(
        event.userId,
      );

      this.logger.log(
        `User ${event.userId} deleted, found ${userLocations.length} locations owned by them`,
      );

      // Business logic: What to do with locations when owner is deleted?
      // Options:
      // 1. Delete all locations
      // 2. Transfer ownership to another user
      // 3. Mark as orphaned

      // Example: Delete all locations (with events)
      for (const location of userLocations) {
        await this.locationService.deleteLocation(location.id);
        await this.locationProducer.publishLocationDeleted(
          location,
          'system',
          'Owner account deleted',
        );
      }

      this.logger.log(
        `Deleted ${userLocations.length} locations due to owner deletion`,
      );
    } catch (error) {
      this.logger.error(`Failed to process user.deleted event:`, error);
      throw error;
    }
  }

  // ==================== INTERNAL EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.LOCATION.EVENTS.CREATED,
    queue: RabbitMQConfig.LOCATION.QUEUES.EVENT_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.LOCATION.QUEUES.EVENT_CREATED,
    ),
  })
  async handleInternalLocationCreated(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.LOCATION.EVENTS.CREATED} for location ${event.locationId}`,
    );

    // Handle internal business logic when a location is created
    // Examples:
    // - Update location cache
    // - Send welcome notification to owner
    // - Update location analytics
    // - Trigger geocoding validation

    try {
      // Example: Validate location coordinates
      const location = await this.locationService.getLocation(event.locationId);

      // Simple validation - ensure coordinates are within reasonable bounds
      const { latitude, longitude } = location.coordinates;
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        this.logger.warn(
          `Location ${event.locationId} has invalid coordinates`,
        );
        // Could publish a correction event or send notification
      }
    } catch (error) {
      this.logger.error(
        `Failed to process internal ${RabbitMQConfig.LOCATION.EVENTS.CREATED}:`,
        error,
      );
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.LOCATION.EVENTS.COORDINATES_UPDATED,
    queue: 'locations.event.coordinates.updated.queue',
  })
  async handleLocationCoordinatesUpdated(event: any) {
    this.logger.log(
      `Processing ${RabbitMQConfig.LOCATION.EVENTS.COORDINATES_UPDATED} for location ${event.locationId}`,
    );

    // Handle coordinate updates
    // Examples:
    // - Update distance calculations for shipments/routes
    // - Recalculate nearby locations
    // - Update map caches

    try {
      await this.locationService.getLocation(event.locationId);

      // Calculate how far the location moved
      const distanceMoved = calculateDistanceBetweenCoordinates(
        event.previousCoordinates,
        event.newCoordinates,
      );

      this.logger.log(
        `Location ${event.locationId} moved ${distanceMoved.toFixed(2)} km`,
      );

      if (distanceMoved > 1) {
        // If moved more than 1 km
        // Trigger updates for dependent entities (shipments, routes, etc.)
        // Could publish another event for dependent services
      }
    } catch (error) {
      this.logger.error(
        `Failed to process ${RabbitMQConfig.LOCATION.EVENTS.COORDINATES_UPDATED}:`,
        error,
      );
    }
  }
}
