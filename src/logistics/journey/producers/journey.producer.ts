/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBusService } from '../../../shared/rabbitmq/rabbitmq.service.js';
import { Journey, JourneyStatus } from '../journey.types.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';

export interface JourneyCreatedEvent {
  journeyId: string;
  agentId: string;
  fromLocationId: string;
  toLocationId: string;
  availableFrom: string;
  availableTo: string;
  capacity: number;
  price: number;
  status: JourneyStatus;
  parcelHandlingInfo: any;
  createdAt: string;
}

export interface JourneyUpdatedEvent {
  journeyId: string;
  previousStatus?: JourneyStatus;
  newStatus?: JourneyStatus;
  updatedFields: {
    capacity?: number;
    price?: number;
    availableFrom?: string;
    availableTo?: string;
    fromLocationId?: string;
    toLocationId?: string;
    parcelHandlingInfo?: any;
  };
  updatedAt: string;
  changedBy?: string;
}

export interface JourneyStatusChangedEvent {
  journeyId: string;
  agentId: string;
  previousStatus: JourneyStatus;
  newStatus: JourneyStatus;
  reason?: string;
  changedBy: string;
  timestamp: string;
  metadata?: {
    bookingId?: string;
    stepIds?: string[];
    transactionId?: string;
  };
}

export interface JourneyDeletedEvent {
  journeyId: string;
  agentId: string;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}

export interface JourneyCapacityUpdatedEvent {
  journeyId: string;
  previousCapacity: number;
  newCapacity: number;
  updatedAt: string;
  updatedBy: string;
  reason?: string;
}

export interface JourneyPriceUpdatedEvent {
  journeyId: string;
  previousPrice: number;
  newPrice: number;
  updatedAt: string;
  updatedBy: string;
  reason?: string;
}

export interface JourneyAgentAssignedEvent {
  journeyId: string;
  agentId: string;
  assignedBy: string;
  assignedAt: string;
  metadata?: {
    previousAgentId?: string;
    assignmentReason?: string;
  };
}

@Injectable()
export class JourneyProducer {
  private readonly logger = new Logger(JourneyProducer.name);
  private readonly config = RabbitMQConfig.JOURNEY;

  constructor(
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  // ==================== EVENT PUBLISHING ====================

  async publishJourneyCreated(journey: Journey): Promise<boolean> {
    const event: JourneyCreatedEvent = {
      journeyId: journey.id,
      agentId: journey.agentId,
      fromLocationId: journey.fromLocationId,
      toLocationId: journey.toLocationId,
      availableFrom: journey.availableFrom,
      availableTo: journey.availableTo,
      capacity: journey.capacity,
      price: journey.price,
      status: journey.status || JourneyStatus.AVAILABLE,
      parcelHandlingInfo: journey.parcelHandlingInfo,
      createdAt: journey.createdAt || new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.CREATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'journey',
          'x-event-type': 'created',
          'x-journey-id': journey.id,
          'x-journey-status': journey.status || JourneyStatus.AVAILABLE,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.CREATED} for journey ${journey.id}`,
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

  async publishJourneyUpdated(
    journeyId: string,
    previousStatus: JourneyStatus,
    update: any,
    changedBy?: string,
  ): Promise<boolean> {
    const event: JourneyUpdatedEvent = {
      journeyId,
      previousStatus,
      newStatus: update.status || previousStatus,
      updatedFields: update,
      updatedAt: new Date().toISOString(),
      changedBy,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'journey',
          'x-event-type': 'updated',
          'x-journey-id': journeyId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.UPDATED} for journey ${journeyId}`,
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

  async publishJourneyStatusChanged(
    journeyId: string,
    agentId: string,
    previousStatus: JourneyStatus,
    newStatus: JourneyStatus,
    changedBy: string,
    metadata?: {
      bookingId?: string;
      stepIds?: string[];
      transactionId?: string;
    },
  ): Promise<boolean> {
    const event: JourneyStatusChangedEvent = {
      journeyId,
      agentId,
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
            'x-entity-type': 'journey',
            'x-event-type': 'status_changed',
            'x-journey-id': journeyId,
            'x-previous-status': previousStatus,
            'x-new-status': newStatus,
          },
        },
      );

      // Specific status events
      if (newStatus === JourneyStatus.BOOKED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.BOOKED,
          { ...event, bookedAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newStatus === JourneyStatus.COMPLETED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.COMPLETED,
          { ...event, completedAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newStatus === JourneyStatus.CANCELLED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.CANCELLED,
          { ...event, cancelledAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newStatus === JourneyStatus.AVAILABLE) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.AVAILABLE,
          { ...event, madeAvailableAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      }

      this.logger.log(
        `Published ${this.config.EVENTS.STATUS_CHANGED}: ${previousStatus} → ${newStatus} for journey ${journeyId}`,
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

  async publishJourneyDeleted(
    journeyId: string,
    agentId: string,
    deletedBy?: string,
    reason?: string,
  ): Promise<boolean> {
    const event: JourneyDeletedEvent = {
      journeyId,
      agentId,
      deletedAt: new Date().toISOString(),
      deletedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.DELETED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'journey',
          'x-event-type': 'deleted',
          'x-journey-id': journeyId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.DELETED} for journey ${journeyId}`,
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

  async publishJourneyCapacityUpdated(
    journeyId: string,
    previousCapacity: number,
    newCapacity: number,
    updatedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: JourneyCapacityUpdatedEvent = {
      journeyId,
      previousCapacity,
      newCapacity,
      updatedAt: new Date().toISOString(),
      updatedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(
        this.config.EVENTS.CAPACITY_UPDATED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'journey',
            'x-event-type': 'capacity_updated',
            'x-journey-id': journeyId,
          },
        },
      );
      this.logger.log(
        `Published ${this.config.EVENTS.CAPACITY_UPDATED} for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.CAPACITY_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishJourneyPriceUpdated(
    journeyId: string,
    previousPrice: number,
    newPrice: number,
    updatedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event: JourneyPriceUpdatedEvent = {
      journeyId,
      previousPrice,
      newPrice,
      updatedAt: new Date().toISOString(),
      updatedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.PRICE_UPDATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'journey',
          'x-event-type': 'price_updated',
          'x-journey-id': journeyId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.PRICE_UPDATED} for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.PRICE_UPDATED}:`,
        error,
      );
      return false;
    }
  }

  async publishJourneyAgentAssigned(
    journeyId: string,
    agentId: string,
    assignedBy: string,
    metadata?: {
      previousAgentId?: string;
      assignmentReason?: string;
    },
  ): Promise<boolean> {
    const event: JourneyAgentAssignedEvent = {
      journeyId,
      agentId,
      assignedBy,
      assignedAt: new Date().toISOString(),
      metadata,
    };

    try {
      await this.messageBus.emitEvent(
        this.config.EVENTS.AGENT_ASSIGNED,
        event,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
          headers: {
            'x-event-version': '1.0',
            'x-entity-type': 'journey',
            'x-event-type': 'agent_assigned',
            'x-journey-id': journeyId,
            'x-agent-id': agentId,
          },
        },
      );
      this.logger.log(
        `Published ${this.config.EVENTS.AGENT_ASSIGNED} for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.AGENT_ASSIGNED}:`,
        error,
      );
      return false;
    }
  }

  // ==================== COMMAND PUBLISHING ====================

  async sendBookJourneyCommand(
    journeyId: string,
    bookerId: string,
    metadata?: {
      stepIds?: string[];
      shipmentIds?: string[];
      bookingNotes?: string;
    },
  ): Promise<boolean> {
    const command = {
      journeyId,
      bookerId,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(this.config.COMMANDS.BOOK, command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}_${journeyId}`,
          'x-journey-id': journeyId,
        },
      });
      this.logger.log(
        `Sent ${this.config.COMMANDS.BOOK} for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(`Failed to send ${this.config.COMMANDS.BOOK}:`, error);
      return false;
    }
  }

  async sendCancelJourneyCommand(
    journeyId: string,
    cancelledBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      journeyId,
      cancelledBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(this.config.COMMANDS.CANCEL, command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}_${journeyId}`,
          'x-journey-id': journeyId,
        },
      });
      this.logger.log(
        `Sent ${this.config.COMMANDS.CANCEL} for journey ${journeyId}`,
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

  async sendCompleteJourneyCommand(
    journeyId: string,
    completedBy: string,
    metadata?: {
      completionNotes?: string;
      actualCompletionTime?: string;
    },
  ): Promise<boolean> {
    const command = {
      journeyId,
      completedBy,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.COMPLETE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${journeyId}`,
            'x-journey-id': journeyId,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.COMPLETE} for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.COMPLETE}:`,
        error,
      );
      return false;
    }
  }

  async sendUpdateJourneyStatusCommand(
    journeyId: string,
    newStatus: JourneyStatus,
    requestedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      journeyId,
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
            'x-command-id': `cmd_${Date.now()}_${journeyId}`,
            'x-journey-id': journeyId,
            'x-new-status': newStatus,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.UPDATE_STATUS} for journey ${journeyId}`,
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

  async sendAssignAgentCommand(
    journeyId: string,
    agentId: string,
    assignedBy: string,
    metadata?: {
      assignmentReason?: string;
      effectiveFrom?: string;
    },
  ): Promise<boolean> {
    const command = {
      journeyId,
      agentId,
      assignedBy,
      metadata,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.ASSIGN_AGENT,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${journeyId}`,
            'x-journey-id': journeyId,
            'x-agent-id': agentId,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.ASSIGN_AGENT} for journey ${journeyId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.ASSIGN_AGENT}:`,
        error,
      );
      return false;
    }
  }

  // ==================== RPC METHODS ====================

  async rpcGetJourneys(filters: any): Promise<any> {
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

  async rpcValidateJourneyBooking(
    journeyId: string,
    bookerId: string,
    metadata?: any,
  ): Promise<{
    valid: boolean;
    reason?: string;
    capacity?: number;
    available?: boolean;
  }> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.VALIDATE_BOOKING,
        { journeyId, bookerId, metadata },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${journeyId}`,
            'x-journey-id': journeyId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.VALIDATE_BOOKING} failed:`,
        error,
      );
      return {
        valid: false,
        reason: 'RPC call failed. Service unavailable.',
        capacity: 0,
        available: false,
      };
    }
  }

  async rpcQueryAvailableJourneys(
    fromLocationId?: string,
    toLocationId?: string,
    dateRange?: { from: string; to: string },
    minCapacity?: number,
    maxPrice?: number,
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.QUERY_AVAILABLE,
        { fromLocationId, toLocationId, dateRange, minCapacity, maxPrice },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 8000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}`,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.QUERY_AVAILABLE} failed:`,
        error,
      );
      throw error;
    }
  }

  async rpcCheckJourneyCapacity(
    journeyId: string,
    requiredCapacity: number,
  ): Promise<{ hasCapacity: boolean; available: number; total: number }> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.CHECK_CAPACITY,
        { journeyId, requiredCapacity },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 3000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${journeyId}`,
            'x-journey-id': journeyId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.CHECK_CAPACITY} failed:`,
        error,
      );
      return {
        hasCapacity: false,
        available: 0,
        total: 0,
      };
    }
  }

  async rpcGetJourneysByAgent(
    agentId: string,
    status?: JourneyStatus,
    dateRange?: { from: string; to: string },
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET_BY_AGENT,
        { agentId, status, dateRange },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 8000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${agentId}`,
            'x-agent-id': agentId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.GET_BY_AGENT} failed:`,
        error,
      );
      throw error;
    }
  }
}
