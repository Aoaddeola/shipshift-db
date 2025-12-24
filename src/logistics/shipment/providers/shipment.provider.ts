import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBusService } from '../../../shared/rabbitmq/rabbitmq.service.js';
import { Shipment, ShipmentStatus } from '../shipment.types.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';
import { ShipmentUpdateDto } from '../shipment-update.dto.js';
import { ShipmentCreateDto } from '../shipment-create.dto.js';

export interface ShipmentCreatedEvent {
  shipmentId: string;
  senderId: string;
  parcelId: string;
  fromLocationId: string;
  toLocationId: string;
  missionId?: string;
  journeyId?: string;
  status: ShipmentStatus;
  createdAt: string;
  metadata?: {
    estimatedDelivery?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    insuranceAmount?: number;
    specialInstructions?: string;
  };
}

export interface ShipmentUpdatedEvent {
  shipmentId: string;
  previousStatus?: ShipmentStatus;
  newStatus?: ShipmentStatus;
  updatedFields: Partial<ShipmentUpdateDto>;
  updatedAt: string;
  changedBy?: string;
  metadata?: {
    reason?: string;
    source?: string;
  };
}

export interface ShipmentStatusChangedEvent {
  shipmentId: string;
  senderId: string;
  previousStatus: ShipmentStatus;
  newStatus: ShipmentStatus;
  reason?: string;
  changedBy: string;
  timestamp: string;
  metadata?: {
    locationId?: string;
    operatorId?: string;
    journeyId?: string;
    stepId?: string;
  };
}

export interface ShipmentDeletedEvent {
  shipmentId: string;
  senderId: string;
  fromLocationId: string;
  toLocationId: string;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}

export interface ShipmentsBatchUpdatedEvent {
  senderId?: string;
  parcelId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  status?: ShipmentStatus;
  filterCriteria: Record<string, any>;
  updateCount: number;
  updatedFields: Partial<ShipmentUpdateDto>;
  requestedBy: string;
  timestamp: string;
}

export interface ShipmentAssignedJourneyEvent {
  shipmentId: string;
  journeyId: string;
  assignedBy: string;
  assignedAt: string;
  metadata?: {
    estimatedStart?: string;
    estimatedEnd?: string;
  };
}

export interface ShipmentAssignedMissionEvent {
  shipmentId: string;
  missionId: string;
  assignedBy: string;
  assignedAt: string;
  metadata?: {
    missionType?: string;
    priority?: string;
  };
}

export interface ShipmentReadyForPickupEvent {
  shipmentId: string;
  readyAt: string;
  locationId: string;
  preparedBy?: string;
  metadata?: {
    pickupWindowStart?: string;
    pickupWindowEnd?: string;
    instructions?: string;
  };
}

@Injectable()
export class ShipmentProducer {
  private readonly logger = new Logger(ShipmentProducer.name);
  private readonly config = RabbitMQConfig.SHIPMENT;

  constructor(
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  // ==================== EVENT PUBLISHING METHODS ====================

  async publishShipmentCreated(shipment: Shipment): Promise<boolean> {
    const event: ShipmentCreatedEvent = {
      shipmentId: shipment.id,
      senderId: shipment.senderId,
      parcelId: shipment.parcelId,
      fromLocationId: shipment.fromLocationId,
      toLocationId: shipment.toLocationId,
      missionId: shipment.missionId,
      journeyId: shipment.journeyId,
      status: shipment.status,
      createdAt: shipment.createdAt || new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.CREATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'shipment',
          'x-event-type': 'created',
          'x-shipment-id': shipment.id,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.CREATED} for shipment ${shipment.id}`,
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

  async publishShipmentUpdated(
    shipmentId: string,
    previousStatus: ShipmentStatus,
    update: Partial<ShipmentUpdateDto>,
    changedBy?: string,
    metadata?: {
      reason?: string;
      source?: string;
    },
  ): Promise<boolean> {
    const event: ShipmentUpdatedEvent = {
      shipmentId,
      previousStatus,
      newStatus: update.status || previousStatus,
      updatedFields: update,
      updatedAt: new Date().toISOString(),
      changedBy,
      metadata,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'shipment',
          'x-event-type': 'updated',
          'x-shipment-id': shipmentId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.UPDATED} for shipment ${shipmentId}`,
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

  async publishShipmentStatusChanged(
    shipmentId: string,
    senderId: string,
    previousStatus: ShipmentStatus,
    newStatus: ShipmentStatus,
    changedBy: string,
    metadata?: {
      locationId?: string;
      operatorId?: string;
      journeyId?: string;
      stepId?: string;
    },
  ): Promise<boolean> {
    const event: ShipmentStatusChangedEvent = {
      shipmentId,
      senderId,
      previousStatus,
      newStatus,
      changedBy,
      timestamp: new Date().toISOString(),
      metadata,
    };

    try {
      // Main status change event
      await this.messageBus.emitEvent(
        this.config.EVENTS.STATUS_CHANGED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'shipment',
            'x-event-type': 'status_changed',
            'x-shipment-id': shipmentId,
            'x-previous-status': ShipmentStatus[previousStatus],
            'x-new-status': ShipmentStatus[newStatus],
          },
        },
      );

      // Specific status events
      if (newStatus === ShipmentStatus.INITIALIZED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.READY_FOR_PICKUP,
          { ...event, readyAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newStatus === ShipmentStatus.IN_TRANSIT) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.PICKED_UP,
          { ...event, pickedUpAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newStatus === ShipmentStatus.DELIVERED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.DELIVERED,
          { ...event, deliveredAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newStatus === ShipmentStatus.ABORTED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.CANCELLED,
          { ...event, cancelledAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      }

      this.logger.log(
        `Published ${this.config.EVENTS.STATUS_CHANGED}: ${ShipmentStatus[previousStatus]} → ${ShipmentStatus[newStatus]} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.STATUS_CHANGED}:`,
        error,
      );
      return false;
    }
  }

  async publishShipmentDeleted(
    shipmentId: string,
    senderId: string,
    fromLocationId: string,
    toLocationId: string,
    deletedBy?: string,
    reason?: string,
  ): Promise<boolean> {
    const event: ShipmentDeletedEvent = {
      shipmentId,
      senderId,
      fromLocationId,
      toLocationId,
      deletedAt: new Date().toISOString(),
      deletedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.DELETED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'shipment',
          'x-event-type': 'deleted',
          'x-shipment-id': shipmentId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.DELETED} for shipment ${shipmentId}`,
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

  async publishShipmentAssignedJourney(
    shipmentId: string,
    journeyId: string,
    assignedBy: string,
    metadata?: {
      estimatedStart?: string;
      estimatedEnd?: string;
    },
  ): Promise<boolean> {
    const event: ShipmentAssignedJourneyEvent = {
      shipmentId,
      journeyId,
      assignedBy,
      assignedAt: new Date().toISOString(),
      metadata,
    };

    try {
      await this.messageBus.emitEvent(
        this.config.EVENTS.ASSIGNED_JOURNEY,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'shipment',
            'x-event-type': 'assigned_journey',
            'x-shipment-id': shipmentId,
            'x-journey-id': journeyId,
          },
        },
      );
      this.logger.log(
        `Published ${this.config.EVENTS.ASSIGNED_JOURNEY} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.ASSIGNED_JOURNEY}:`,
        error,
      );
      return false;
    }
  }

  async publishShipmentAssignedMission(
    shipmentId: string,
    missionId: string,
    assignedBy: string,
    metadata?: {
      missionType?: string;
      priority?: string;
    },
  ): Promise<boolean> {
    const event: ShipmentAssignedMissionEvent = {
      shipmentId,
      missionId,
      assignedBy,
      assignedAt: new Date().toISOString(),
      metadata,
    };

    try {
      await this.messageBus.emitEvent(
        this.config.EVENTS.ASSIGNED_MISSION,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'shipment',
            'x-event-type': 'assigned_mission',
            'x-shipment-id': shipmentId,
            'x-mission-id': missionId,
          },
        },
      );
      this.logger.log(
        `Published ${this.config.EVENTS.ASSIGNED_MISSION} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.ASSIGNED_MISSION}:`,
        error,
      );
      return false;
    }
  }

  async publishShipmentsBatchUpdated(
    updateCount: number,
    filterCriteria: Record<string, any>,
    updatedFields: Partial<ShipmentUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event: ShipmentsBatchUpdatedEvent = {
      senderId: filterCriteria.senderId,
      parcelId: filterCriteria.parcelId,
      fromLocationId: filterCriteria.fromLocationId,
      toLocationId: filterCriteria.toLocationId,
      status: filterCriteria.status,
      filterCriteria,
      updateCount,
      updatedFields,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.BATCH_UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'shipment',
          'x-event-type': 'batch_updated',
          'x-update-count': updateCount.toString(),
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.BATCH_UPDATED} for ${updateCount} shipments`,
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

  async sendProcessShipmentCommand(
    shipmentId: string,
    action: 'prepare' | 'pickup' | 'deliver' | 'cancel',
    performerId: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      shipmentId,
      action,
      performerId,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(this.config.COMMANDS.PROCESS, command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}_${shipmentId}`,
          'x-shipment-id': shipmentId,
        },
      });
      this.logger.log(
        `Sent ${this.config.COMMANDS.PROCESS} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.PROCESS}:`,
        error,
      );
      return false;
    }
  }

  async sendAssignJourneyCommand(
    shipmentId: string,
    journeyId: string,
    assignedBy: string,
  ): Promise<boolean> {
    const command = {
      shipmentId,
      journeyId,
      assignedBy,
      assignedAt: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.ASSIGN_JOURNEY,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${shipmentId}`,
            'x-shipment-id': shipmentId,
            'x-journey-id': journeyId,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.ASSIGN_JOURNEY} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.ASSIGN_JOURNEY}:`,
        error,
      );
      return false;
    }
  }

  async sendCreateJourneyCommand(
    shipmentId: string,
    requestedBy: string,
    metadata?: {
      preferredOperatorId?: string;
      estimatedStart?: string;
      estimatedEnd?: string;
      priority?: string;
    },
  ): Promise<boolean> {
    const command = {
      shipmentId,
      requestedBy,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.CREATE_JOURNEY,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${shipmentId}`,
            'x-shipment-id': shipmentId,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.CREATE_JOURNEY} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.CREATE_JOURNEY}:`,
        error,
      );
      return false;
    }
  }

  async sendUpdateStatusCommand(
    shipmentId: string,
    newStatus: ShipmentStatus,
    requestedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      shipmentId,
      newStatus,
      requestedBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.UPDATE_STATUS,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${shipmentId}`,
            'x-shipment-id': shipmentId,
            'x-new-status': ShipmentStatus[newStatus],
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.UPDATE_STATUS} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.UPDATE_STATUS}:`,
        error,
      );
      return false;
    }
  }

  async sendCancelShipmentCommand(
    shipmentId: string,
    cancelledBy: string,
    reason: string,
    refundDetails?: {
      amount: number;
      currency: string;
      method: string;
    },
  ): Promise<boolean> {
    const command = {
      shipmentId,
      cancelledBy,
      reason,
      refundDetails,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(this.config.COMMANDS.CANCEL, command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}_${shipmentId}`,
          'x-shipment-id': shipmentId,
        },
      });
      this.logger.log(
        `Sent ${this.config.COMMANDS.CANCEL} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.CANCEL}:`,
        error,
      );
      return false;
    }
  }

  // ==================== RPC METHODS ====================

  async rpcGetShipments(filters: any): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET_BATCH,
        { filters },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 10000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.GET_BATCH} failed:`, error);
      throw error;
    }
  }

  async rpcValidateShipment(shipmentData: Partial<ShipmentCreateDto>): Promise<{
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    suggestions?: string[];
  }> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.VALIDATE,
        { shipmentData },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}`,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.VALIDATE} failed:`, error);
      return {
        valid: false,
        errors: ['RPC call failed. Service unavailable.'],
      };
    }
  }

  async rpcGetShipmentWithRelations(
    shipmentId: string,
    relations: string[],
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET_WITH_RELATIONS,
        { shipmentId, relations },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 8000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${shipmentId}`,
            'x-shipment-id': shipmentId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.GET_WITH_RELATIONS} failed:`,
        error,
      );
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  async sendNotifyStakeholdersCommand(
    shipmentId: string,
    notificationType:
      | 'status_update'
      | 'delay'
      | 'arrival'
      | 'issue'
      | 'payment',
    stakeholders: string[],
    message: string,
    sentBy: string,
    urgency: 'low' | 'medium' | 'high' = 'medium',
  ): Promise<boolean> {
    const command = {
      shipmentId,
      notificationType,
      stakeholders,
      message,
      sentBy,
      urgency,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.NOTIFY_STAKEHOLDERS,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${shipmentId}`,
            'x-shipment-id': shipmentId,
            'x-notification-type': notificationType,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.NOTIFY_STAKEHOLDERS} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.NOTIFY_STAKEHOLDERS}:`,
        error,
      );
      return false;
    }
  }

  async publishShipmentReadyForPickup(
    shipmentId: string,
    locationId: string,
    preparedBy?: string,
    metadata?: {
      pickupWindowStart?: string;
      pickupWindowEnd?: string;
      instructions?: string;
      photos?: string[];
    },
  ): Promise<boolean> {
    const event: ShipmentReadyForPickupEvent = {
      shipmentId,
      readyAt: new Date().toISOString(),
      locationId,
      preparedBy,
      metadata,
    };

    try {
      await this.messageBus.emitEvent(
        this.config.EVENTS.READY_FOR_PICKUP,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'shipment',
            'x-event-type': 'ready_for_pickup',
            'x-shipment-id': shipmentId,
          },
        },
      );
      this.logger.log(
        `Published ${this.config.EVENTS.READY_FOR_PICKUP} for shipment ${shipmentId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.READY_FOR_PICKUP}:`,
        error,
      );
      return false;
    }
  }
}
