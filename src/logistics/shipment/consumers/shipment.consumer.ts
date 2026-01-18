/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { ShipmentService } from '../shipment.service.js';
import { ShipmentStatus } from '../shipment.types.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';
import { LocationService } from '../../../common/location/location.service.js';
import { JourneyService } from '../../../logistics/journey/journey.service.js';
import { MissionService } from '../../../logistics/mission/mission.service.js';
import { ParcelService } from '../../../logistics/parcel/parcel.service.js';
import { ShipmentProducer } from '../providers/shipment.provider.js';
import { ShipmentManager } from '../shipment.manager.js';
import { UserService } from '../../../users/user/user.service.js';

@Injectable()
export class ShipmentConsumer {
  private readonly logger = new Logger(ShipmentConsumer.name);
  private readonly config = RabbitMQConfig.SHIPMENT;

  constructor(
    @Inject(ShipmentService)
    private readonly shipmentService: ShipmentService,
    @Inject(ShipmentProducer)
    private readonly shipmentProducer: ShipmentProducer,
    @Inject(JourneyService)
    private readonly journeyService: JourneyService,
    @Inject(MissionService)
    private readonly missionService: MissionService,
    @Inject(ParcelService)
    private readonly parcelService: ParcelService,
    @Inject(LocationService)
    private readonly locationService: LocationService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  // ==================== INTEGRATION HANDLERS (Other entity events) ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.PARCEL.EVENTS.CREATED, // Assuming you have parcel config
    queue: RabbitMQConfig.SHIPMENT.QUEUES.PARCEL_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.SHIPMENT.QUEUES.PARCEL_CREATED,
    ),
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('ShipmentConsumer-ParcelCreated');
      logger.error(
        `Failed to process parcel.created:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleParcelCreated(event: any) {
    this.logger.log(`Processing parcel.created for parcel ${event.parcelId}`);

    // Example: When a parcel is created, you might want to validate shipments using this parcel
    // const shipments = await this.shipmentService.getShipmentsByParcel(event.parcelId);
    // for (const shipment of shipments) {
    //   // Validate or update shipments
    // }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.LOCATION.EVENTS.CREATED, // Assuming you have location config
    queue: RabbitMQConfig.SHIPMENT.QUEUES.LOCATION_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.SHIPMENT.QUEUES.LOCATION_CREATED,
    ),
  })
  async handleLocationCreated(event: any) {
    this.logger.log(
      `Processing location.created for location ${event.locationId}`,
    );

    // Example: When a location is created, update shipments using this location
    // const fromShipments = await this.shipmentService.getShipmentsByFromLocation(event.locationId);
    // const toShipments = await this.shipmentService.getShipmentsByToLocation(event.locationId);
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.MISSION.EVENTS.CREATED, // Assuming you have mission config
    queue: RabbitMQConfig.SHIPMENT.QUEUES.MISSION_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.SHIPMENT.QUEUES.MISSION_CREATED,
    ),
  })
  async handleMissionCreated(event: any) {
    this.logger.log(
      `Processing mission.created for mission ${event.missionId}`,
    );

    // Example: When a mission is created, assign eligible shipments
    // const eligibleShipments = await this.shipmentService.getShipmentsByStatus(ShipmentStatus.PENDING);
    // for (const shipment of eligibleShipments) {
    //   await this.shipmentService.partialUpdateShipment(shipment.id, {
    //     missionId: event.missionId,
    //   });
    //   await this.shipmentProducer.publishShipmentAssignedMission(
    //     shipment.id,
    //     event.missionId,
    //     'system'
    //   );
    // }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.JOURNEY.EVENTS.CREATED, // Assuming you have journey config
    queue: RabbitMQConfig.SHIPMENT.QUEUES.JOURNEY_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.SHIPMENT.QUEUES.JOURNEY_CREATED,
    ),
  })
  async handleJourneyCreated(event: any) {
    this.logger.log(
      `Processing journey.created for journey ${event.journeyId}`,
    );

    // Example: When a journey is created, assign pending shipments to it
    // const pendingShipments = await this.shipmentService.getShipmentsByStatus(ShipmentStatus.READY_FOR_PICKUP);
    // for (const shipment of pendingShipments) {
    //   await this.shipmentService.partialUpdateShipment(shipment.id, {
    //     journeyId: event.journeyId,
    //   });
    //   await this.shipmentProducer.publishShipmentAssignedJourney(
    //     shipment.id,
    //     event.journeyId,
    //     'system'
    //   );
    // }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.STATE_CHANGED, // From Step module
    queue: RabbitMQConfig.SHIPMENT.QUEUES.STEP_STATE_CHANGED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.SHIPMENT.QUEUES.STEP_STATE_CHANGED,
    ),
  })
  async handleStepStateChanged(event: any) {
    this.logger.log(
      `Processing step.state.changed for step ${event.data.stepId}`,
    );

    const shipment = await this.shipmentService.getShipment(
      event.data.shipmentId,
    );

    // Create a 3-step shipment
    const manager = new ShipmentManager(
      event.data.shipmentSteps.length,
      event.data.shipmentSteps,
    );

    const newShipmentStatus = manager.calculateOverallStatus();

    if (shipment.status !== newShipmentStatus) {
      await this.shipmentService.partialUpdateShipment(event.data.shipmentId, {
        status: newShipmentStatus,
      });
      if (newShipmentStatus === ShipmentStatus.DELIVERED) {
        await this.shipmentProducer.publishShipmentStatusChanged(
          event.shipmentId,
          shipment.senderId,
          shipment.status,
          ShipmentStatus.DELIVERED,
          'system',
          { stepId: event.data.stepId },
        );
      }
    }

    this.logger.log(
      `Overall Shipment Status for ${shipment.id} - ${manager.calculateOverallStatus()}`,
    );
  }

  // ==================== COMMAND HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.SHIPMENT.COMMANDS.PROCESS,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.COMMAND_PROCESS,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('ShipmentConsumer-CommandProcess');
      logger.error(
        `Failed to process command ${RabbitMQConfig.SHIPMENT.COMMANDS.PROCESS}:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleProcessShipmentCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.SHIPMENT.COMMANDS.PROCESS} for shipment ${command.shipmentId}`,
    );

    try {
      const shipment = await this.shipmentService.getShipment(
        command.shipmentId,
      );

      switch (command.action) {
        case 'prepare':
          if (shipment.status === ShipmentStatus.PENDING) {
            await this.shipmentService.partialUpdateShipment(
              command.shipmentId,
              {
                status: ShipmentStatus.INITIALIZED,
              },
            );
            await this.shipmentProducer.publishShipmentStatusChanged(
              command.shipmentId,
              shipment.senderId,
              shipment.status,
              ShipmentStatus.INITIALIZED,
              command.performerId,
              // { reason: command.reason },
            );
          }
          break;

        case 'pickup':
          if (shipment.status === ShipmentStatus.INITIALIZED) {
            await this.shipmentService.partialUpdateShipment(
              command.shipmentId,
              {
                status: ShipmentStatus.IN_TRANSIT,
              },
            );
            await this.shipmentProducer.publishShipmentStatusChanged(
              command.shipmentId,
              shipment.senderId,
              shipment.status,
              ShipmentStatus.IN_TRANSIT,
              command.performerId,
              // { reason: command.reason },
            );
          }
          break;

        case 'deliver':
          if (shipment.status === ShipmentStatus.IN_TRANSIT) {
            await this.shipmentService.partialUpdateShipment(
              command.shipmentId,
              {
                status: ShipmentStatus.DELIVERED,
              },
            );
            await this.shipmentProducer.publishShipmentStatusChanged(
              command.shipmentId,
              shipment.senderId,
              shipment.status,
              ShipmentStatus.DELIVERED,
              command.performerId,
              // // { reason: command.reason },
            );
          }
          break;

        case 'cancel':
          await this.shipmentService.partialUpdateShipment(command.shipmentId, {
            status: ShipmentStatus.ABORTED,
          });
          await this.shipmentProducer.publishShipmentStatusChanged(
            command.shipmentId,
            shipment.senderId,
            shipment.status,
            ShipmentStatus.ABORTED,
            command.performerId,
            // // { reason: command.reason },
          );
          break;
      }

      this.logger.log(
        `Processed ${command.action} for shipment ${command.shipmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process command for shipment ${command.shipmentId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.SHIPMENT.COMMANDS.ASSIGN_JOURNEY,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.COMMAND_ASSIGN_JOURNEY,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleAssignJourneyCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.SHIPMENT.COMMANDS.ASSIGN_JOURNEY} for shipment ${command.shipmentId}`,
    );

    try {
      await this.shipmentService.getShipment(command.shipmentId);

      // Update shipment with journey ID
      await this.shipmentService.partialUpdateShipment(command.shipmentId, {
        journeyId: command.journeyId,
      });

      // Publish event
      await this.shipmentProducer.publishShipmentAssignedJourney(
        command.shipmentId,
        command.journeyId,
        command.assignedBy,
      );

      this.logger.log(
        `Assigned journey ${command.journeyId} to shipment ${command.shipmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to assign journey to shipment ${command.shipmentId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.SHIPMENT.COMMANDS.CREATE_JOURNEY,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.COMMAND_CREATE_JOURNEY,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleCreateJourneyCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.SHIPMENT.COMMANDS.CREATE_JOURNEY} for shipment ${command.shipmentId}`,
    );

    try {
      await this.shipmentService.getShipment(command.shipmentId);

      // Here you would create a journey through the JourneyService
      // This is a simplified example
      // const journey = await this.journeyService.createJourney({
      //   shipmentId: command.shipmentId,
      //   // ... other journey data from command.metadata
      // });

      // Update shipment with the new journey ID
      // await this.shipmentService.partialUpdateShipment(command.shipmentId, {
      //   journeyId: journey.id,
      // });

      // Publish event
      // await this.shipmentProducer.publishShipmentAssignedJourney(
      //   command.shipmentId,
      //   journey.id,
      //   command.requestedBy
      // );

      this.logger.log(`Created journey for shipment ${command.shipmentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to create journey for shipment ${command.shipmentId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.SHIPMENT.COMMANDS.UPDATE_STATUS,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.COMMAND_UPDATE_STATUS,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleUpdateStatusCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.SHIPMENT.COMMANDS.UPDATE_STATUS} for shipment ${command.shipmentId}`,
    );

    try {
      const shipment = await this.shipmentService.getShipment(
        command.shipmentId,
      );

      // Update shipment status
      await this.shipmentService.partialUpdateShipment(command.shipmentId, {
        status: command.newStatus,
      });

      // Publish status change event
      await this.shipmentProducer.publishShipmentStatusChanged(
        command.shipmentId,
        shipment.senderId,
        shipment.status,
        command.newStatus,
        command.requestedBy,
        // // { reason: command.reason },
      );

      this.logger.log(
        `Updated status of shipment ${command.shipmentId} to ${command.newStatus}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update status for shipment ${command.shipmentId}:`,
        error,
      );
      throw error;
    }
  }

  // ==================== RPC HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.SHIPMENT.RPC.GET_BATCH,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.RPC_GET_BATCH,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetShipmentsRPC(event: {
    filters: any;
    include?: string[];
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.SHIPMENT.RPC.GET_BATCH} with filters`,
      event.filters,
    );

    try {
      let shipments: any[] = [];

      // Use appropriate service method based on filters
      if (event.filters.senderId && event.filters.parcelId) {
        shipments = await this.shipmentService.getShipmentsBySenderAndParcel(
          event.filters.senderId,
          event.filters.parcelId,
          event.include,
        );
      } else if (event.filters.senderId) {
        shipments = await this.shipmentService.getShipmentsBySender(
          event.filters.senderId,
          event.include,
        );
      } else if (event.filters.parcelId) {
        shipments = await this.shipmentService.getShipmentsByParcel(
          event.filters.parcelId,
          event.include,
        );
      } else if (event.filters.status !== undefined) {
        shipments = await this.shipmentService.getShipmentsByStatus(
          event.filters.status,
          event.include,
        );
      } else if (event.filters.fromLocationId && event.filters.toLocationId) {
        shipments = await this.shipmentService.getShipmentsByLocations(
          event.filters.fromLocationId,
          event.filters.toLocationId,
          event.include,
        );
      } else {
        shipments = await this.shipmentService.getShipments(event.include);
      }

      // Apply pagination
      if (event.limit || event.offset) {
        const offset = event.offset || 0;
        const limit = event.limit || shipments.length;
        shipments = shipments.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: shipments,
        count: shipments.length,
        timestamp: new Date().toISOString(),
        metadata: {
          apiVersion: '1.0',
          entity: this.config.ENTITY,
        },
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.SHIPMENT.RPC.GET_BATCH} failed:`,
        error,
      );
      return {
        success: false,
        error: error.message,
        errorCode: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.SHIPMENT.RPC.VALIDATE,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.RPC_VALIDATE,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleValidateShipmentRPC(event: { shipmentData: any }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.SHIPMENT.RPC.VALIDATE} for shipment data`,
    );

    try {
      const errors: string[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];

      // Validate sender exists
      if (event.shipmentData.senderId) {
        try {
          await this.userService.findById(event.shipmentData.senderId);
        } catch {
          errors.push(`Sender ${event.shipmentData.senderId} not found`);
        }
      }

      // Validate parcel exists
      if (event.shipmentData.parcelId) {
        try {
          await this.parcelService.getParcel(event.shipmentData.parcelId);
        } catch {
          errors.push(`Parcel ${event.shipmentData.parcelId} not found`);
        }
      }

      // Validate from location exists
      if (event.shipmentData.fromLocationId) {
        try {
          await this.locationService.getLocation(
            event.shipmentData.fromLocationId,
          );
        } catch {
          errors.push(
            `From location ${event.shipmentData.fromLocationId} not found`,
          );
        }
      }

      // Validate to location exists
      if (event.shipmentData.toLocationId) {
        try {
          await this.locationService.getLocation(
            event.shipmentData.toLocationId,
          );
        } catch {
          errors.push(
            `To location ${event.shipmentData.toLocationId} not found`,
          );
        }
      }

      // Validate mission exists (if provided)
      if (event.shipmentData.missionId) {
        try {
          await this.missionService.getMission(event.shipmentData.missionId);
        } catch {
          warnings.push(
            `Mission ${event.shipmentData.missionId} not found, shipment can proceed without mission`,
          );
        }
      }

      // Validate journey exists (if provided)
      if (event.shipmentData.journeyId) {
        try {
          await this.journeyService.getJourney(event.shipmentData.journeyId);
        } catch {
          errors.push(`Journey ${event.shipmentData.journeyId} not found`);
        }
      }

      // Business logic validations
      if (
        event.shipmentData.fromLocationId === event.shipmentData.toLocationId
      ) {
        warnings.push('From and to locations are the same');
      }

      return {
        success: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.SHIPMENT.RPC.VALIDATE} failed:`,
        error,
      );
      return {
        success: false,
        errors: [error.message],
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.SHIPMENT.RPC.GET_WITH_RELATIONS,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.RPC_GET_WITH_RELATIONS,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetShipmentWithRelationsRPC(event: {
    shipmentId: string;
    relations: string[];
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.SHIPMENT.RPC.GET_WITH_RELATIONS} for shipment ${event.shipmentId}`,
    );

    try {
      const shipment = await this.shipmentService.getShipment(
        event.shipmentId,
        event.relations,
      );

      return {
        success: true,
        data: shipment,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.SHIPMENT.RPC.GET_WITH_RELATIONS} failed:`,
        error,
      );
      return {
        success: false,
        error: error.message,
        errorCode:
          error instanceof NotFoundException ? 'NOT_FOUND' : 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // ==================== INTERNAL EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.SHIPMENT.EVENTS.STATUS_CHANGED,
    queue: RabbitMQConfig.SHIPMENT.QUEUES.EVENT_STATUS_CHANGED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.SHIPMENT.QUEUES.EVENT_STATUS_CHANGED,
    ),
  })
  async handleInternalShipmentStatusChanged(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.SHIPMENT.EVENTS.STATUS_CHANGED} for shipment ${event.shipmentId}`,
    );

    // Handle internal status change events
    // Example: Update cache, trigger notifications, update analytics
  }
}
