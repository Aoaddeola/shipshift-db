/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { JourneyService } from '../journey.service.js';
import { Journey, JourneyStatus } from '../journey.types.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';

@Injectable()
export class JourneyConsumer {
  private readonly logger = new Logger(JourneyConsumer.name);
  private readonly config = RabbitMQConfig.JOURNEY;

  constructor(
    @Inject(JourneyService)
    private readonly journeyService: JourneyService,
  ) {}

  // ==================== EVENT HANDLERS (Integration with other entities) ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.CREATED, // 'step.created'
    queue: RabbitMQConfig.JOURNEY.QUEUES.STEP_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.JOURNEY.QUEUES.STEP_CREATED,
    ),
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('JourneyConsumer-StepCreated');
      logger.error(
        `Failed to process step.created:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleStepCreated(_event: any) {
    const event = _event.data;
    this.logger.log(`Processing step.created for journey ${event.journeyId}`);

    try {
      // When a step is created for a journey, we might want to:
      // 1. Check if journey should be marked as BOOKED if not already
      // 2. Update journey status based on step state

      const journey = await this.journeyService.getJourney(event.journeyId);

      // If journey is AVAILABLE and we have a step created, mark as BOOKED
      if (journey.status === JourneyStatus.AVAILABLE) {
        await this.journeyService.updateJourneyStatus(
          event.journeyId,
          JourneyStatus.BOOKED,
          'system',
          { triggeredBy: 'step_created', stepId: event.stepId },
        );
      }

      // If this is the first step, we might want to associate it with the journey
      // Implementation depends on your business logic
    } catch (error) {
      this.logger.error(
        `Failed to process step.created for journey ${event.journeyId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.STATE_CHANGED, // 'step.state.changed'
    queue: RabbitMQConfig.JOURNEY.QUEUES.STEP_STATE_CHANGED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.JOURNEY.QUEUES.STEP_STATE_CHANGED,
    ),
  })
  async handleStepStateChanged(_event: any) {
    const event = _event.data;
    this.logger.log(
      `Processing step.state.changed for journey ${event.journeyId}`,
    );

    try {
      await this.journeyService.getJourney(event.journeyId);

      // Check if all steps in the journey are completed
      // This would typically require querying all steps for this journey
      // For simplicity, we'll assume the service has a method for this

      // Example: If all steps are COMPLETED, mark journey as COMPLETED
      // const allSteps = await this.stepService.getStepsByJourney(event.journeyId);
      // const allCompleted = allSteps.every(step => step.state === StepState.COMPLETED);

      // if (allCompleted && journey.status !== JourneyStatus.COMPLETED) {
      //   await this.journeyService.updateJourneyStatus(
      //     event.journeyId,
      //     JourneyStatus.COMPLETED,
      //     'system',
      //     { triggeredBy: 'all_steps_completed' }
      //   );
      // }
    } catch (error) {
      this.logger.error(
        `Failed to process step.state.changed for journey ${event.journeyId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.SHIPMENT.EVENTS.CREATED, // 'shipment.created'
    queue: RabbitMQConfig.JOURNEY.QUEUES.SHIPMENT_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.JOURNEY.QUEUES.SHIPMENT_CREATED,
    ),
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handleShipmentCreated(_event: any) {
    // const event = _event.data;
    this.logger.log(
      `Processing shipment.created for potential journey matching`,
    );

    try {
      // When a new shipment is created, we might want to:
      // 1. Find available journeys that match the shipment's requirements
      // 2. Send notifications to relevant agents
      // 3. Auto-assign if criteria match
      // This would involve complex matching logic based on:
      // - Origin/destination locations
      // - Time window
      // - Capacity requirements
      // - Price constraints
      // Example of finding matching journeys:
      // const matchingJourneys = await this.journeyService.findMatchingJourneys({
      //   fromLocationId: event.originId,
      //   toLocationId: event.destinationId,
      //   requiredCapacity: event.estimatedWeight,
      //   earliestPickup: event.earliestPickupTime,
      //   latestDelivery: event.latestDeliveryTime,
      // });
      // if (matchingJourneys.length > 0) {
      //   // Send notification or auto-assign
      //   for (const journey of matchingJourneys) {
      //     await this.journeyService.notifyAgentOfMatchingShipment(
      //       journey.id,
      //       event.shipmentId
      //     );
      //   }
      // }
    } catch (error) {
      this.logger.error(`Failed to process shipment.created:`, error);
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.AGENT?.EVENTS?.UPDATED || 'agent.updated', // Adjust based on your config
    queue: RabbitMQConfig.JOURNEY.QUEUES.AGENT_UPDATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.JOURNEY.QUEUES.AGENT_UPDATED,
    ),
  })
  async handleAgentUpdated(_event: any) {
    const event = _event.data;
    this.logger.log(`Processing agent.updated for agent ${event.agentId}`);

    try {
      // When an agent is updated (e.g., status changed to unavailable),
      // we might need to update all their active journeys

      if (event.status === 'unavailable' || event.status === 'inactive') {
        // Get all active journeys for this agent
        const activeJourneys = await this.journeyService.getJourneysByAgent(
          event.agentId,
          [JourneyStatus.AVAILABLE, JourneyStatus.BOOKED],
        );

        // Update each journey (e.g., mark as CANCELLED or reassign)
        for (const journey of activeJourneys) {
          if (journey.status === JourneyStatus.AVAILABLE) {
            // Simply mark as cancelled if not yet booked
            await this.journeyService.updateJourneyStatus(
              journey.id,
              JourneyStatus.CANCELLED,
              'system',
              { reason: `Agent ${event.agentId} became unavailable` },
            );
          } else if (journey.status === JourneyStatus.BOOKED) {
            // More complex: need to reassign or notify stakeholders
            await this.journeyService.notifyStakeholders(
              journey.id,
              'agent_unavailable',
              `Agent for journey ${journey.id} is no longer available. Seeking alternative arrangements.`,
              'system',
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process agent.updated:`, error);
      throw error;
    }
  }

  // ==================== COMMAND HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.JOURNEY.COMMANDS.BOOK, // 'book.journey'
    queue: RabbitMQConfig.JOURNEY.QUEUES.COMMAND_BOOK,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('JourneyConsumer-CommandBook');
      logger.error(
        `Failed to process command ${RabbitMQConfig.JOURNEY.COMMANDS.BOOK}:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleBookJourneyCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.JOURNEY.COMMANDS.BOOK} for journey ${command.journeyId}`,
    );

    try {
      // Validate the booking
      const validation = await this.journeyService.validateBooking(
        command.journeyId,
        command.bookerId,
        command.metadata,
      );

      if (!validation.valid) {
        throw new Error(`Booking validation failed: ${validation.reason}`);
      }

      // Update journey status to BOOKED
      await this.journeyService.updateJourneyStatus(
        command.journeyId,
        JourneyStatus.BOOKED,
        command.bookerId,
        {
          bookingId: command.metadata?.bookingId,
          stepIds: command.metadata?.stepIds,
          transactionId: command.metadata?.transactionId,
        },
      );

      // Update capacity if needed (reduce available capacity)
      // await this.journeyService.reduceCapacity(
      //   command.journeyId,
      //   command.metadata?.requiredCapacity || 1,
      //   command.bookerId
      // );

      this.logger.log(
        `Journey ${command.journeyId} successfully booked by ${command.bookerId}`,
      );

      return {
        success: true,
        journeyId: command.journeyId,
        bookedBy: command.bookerId,
        bookedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process ${RabbitMQConfig.JOURNEY.COMMANDS.BOOK} for journey ${command.journeyId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.JOURNEY.COMMANDS.CANCEL, // 'cancel.journey'
    queue: RabbitMQConfig.JOURNEY.QUEUES.COMMAND_CANCEL,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleCancelJourneyCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.JOURNEY.COMMANDS.CANCEL} for journey ${command.journeyId}`,
    );

    try {
      const journey = await this.journeyService.getJourney(command.journeyId);

      // Validate cancellation is allowed
      if (journey.status === JourneyStatus.COMPLETED) {
        throw new Error('Cannot cancel a completed journey');
      }

      if (journey.status === JourneyStatus.CANCELLED) {
        this.logger.warn(`Journey ${command.journeyId} is already cancelled`);
        return { success: true, alreadyCancelled: true };
      }

      // Update journey status to CANCELLED
      await this.journeyService.updateJourneyStatus(
        command.journeyId,
        JourneyStatus.CANCELLED,
        command.cancelledBy,
        { reason: command.reason },
      );

      // Restore capacity if needed
      // await this.journeyService.restoreCapacity(
      //   command.journeyId,
      //   command.metadata?.restoredCapacity || 0,
      //   command.cancelledBy
      // );

      // Cancel associated steps
      // const steps = await this.stepService.getStepsByJourney(command.journeyId);
      // for (const step of steps) {
      //   if (step.state !== StepState.COMPLETED && step.state !== StepState.CANCELLED) {
      //     await this.stepService.changeStepState(
      //       step.id,
      //       StepState.CANCELLED,
      //       'system',
      //       { reason: `Journey ${command.journeyId} cancelled` }
      //     );
      //   }
      // }

      this.logger.log(
        `Journey ${command.journeyId} cancelled by ${command.cancelledBy}`,
      );

      return {
        success: true,
        journeyId: command.journeyId,
        cancelledBy: command.cancelledBy,
        cancelledAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process ${RabbitMQConfig.JOURNEY.COMMANDS.CANCEL} for journey ${command.journeyId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.JOURNEY.COMMANDS.COMPLETE, // 'complete.journey'
    queue: RabbitMQConfig.JOURNEY.QUEUES.COMMAND_COMPLETE,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleCompleteJourneyCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.JOURNEY.COMMANDS.COMPLETE} for journey ${command.journeyId}`,
    );

    try {
      const journey = await this.journeyService.getJourney(command.journeyId);

      // Validate completion is allowed
      if (journey.status === JourneyStatus.CANCELLED) {
        throw new Error('Cannot complete a cancelled journey');
      }

      if (journey.status === JourneyStatus.COMPLETED) {
        this.logger.warn(`Journey ${command.journeyId} is already completed`);
        return { success: true, alreadyCompleted: true };
      }

      // Check if all steps are completed
      // const steps = await this.stepService.getStepsByJourney(command.journeyId);
      // const allStepsCompleted = steps.every(step => step.state === StepState.COMPLETED);

      // if (!allStepsCompleted) {
      //   throw new Error('Cannot complete journey: not all steps are completed');
      // }

      // Update journey status to COMPLETED
      await this.journeyService.updateJourneyStatus(
        command.journeyId,
        JourneyStatus.COMPLETED,
        command.completedBy,
        command.metadata,
      );

      // Process payments if needed
      // await this.paymentService.processJourneyCompletion(command.journeyId);

      // Send completion notifications
      // await this.notificationService.sendJourneyCompletionNotifications(command.journeyId);

      this.logger.log(
        `Journey ${command.journeyId} completed by ${command.completedBy}`,
      );

      return {
        success: true,
        journeyId: command.journeyId,
        completedBy: command.completedBy,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process ${RabbitMQConfig.JOURNEY.COMMANDS.COMPLETE} for journey ${command.journeyId}:`,
        error,
      );
      throw error;
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.JOURNEY.COMMANDS.ASSIGN_AGENT, // 'assign.journey.agent'
    queue: RabbitMQConfig.JOURNEY.QUEUES.COMMAND_ASSIGN_AGENT,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
  })
  async handleAssignAgentCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.JOURNEY.COMMANDS.ASSIGN_AGENT} for journey ${command.journeyId}`,
    );

    try {
      // Assign agent to journey
      await this.journeyService.assignAgent(
        command.journeyId,
        command.agentId,
        command.assignedBy,
        command.metadata,
      );

      this.logger.log(
        `Agent ${command.agentId} assigned to journey ${command.journeyId}`,
      );

      return {
        success: true,
        journeyId: command.journeyId,
        agentId: command.agentId,
        assignedBy: command.assignedBy,
        assignedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to process ${RabbitMQConfig.JOURNEY.COMMANDS.ASSIGN_AGENT} for journey ${command.journeyId}:`,
        error,
      );
      throw error;
    }
  }

  // ==================== RPC HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.JOURNEY.RPC.GET_BATCH, // 'rpc.get.journeys'
    queue: RabbitMQConfig.JOURNEY.QUEUES.RPC_GET_BATCH,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetJourneysRPC(event: {
    filters: {
      agentId?: string;
      status?: JourneyStatus;
      fromLocationId?: string;
      toLocationId?: string;
      dateRange?: { from: string; to: string };
      minCapacity?: number;
      maxPrice?: number;
      include?: string[];
    };
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.JOURNEY.RPC.GET_BATCH} with filters`,
      event.filters,
    );

    try {
      let journeys: Journey[] = [];

      // Use appropriate service method based on filters
      if (event.filters.agentId) {
        journeys = await this.journeyService.getJourneysByAgent(
          event.filters.agentId,
          event.filters.include,
        );
      } else if (event.filters.fromLocationId && event.filters.toLocationId) {
        journeys = await this.journeyService.getJourneysByRoute(
          event.filters.fromLocationId,
          event.filters.toLocationId,
          event.filters.status,
          event.filters.include,
        );
      } else if (event.filters.status) {
        journeys = await this.journeyService.getJourneysByStatus(
          event.filters.status,
          event.filters.include,
        );
      } else {
        journeys = await this.journeyService.getAllJourneys(
          event.filters.include,
        );
      }

      // Apply additional filters
      if (event.filters.minCapacity !== undefined) {
        journeys = journeys.filter(
          (j) => j.capacity >= event.filters.minCapacity!,
        );
      }

      if (event.filters.maxPrice !== undefined) {
        journeys = journeys.filter((j) => j.price <= event.filters.maxPrice!);
      }

      // Apply pagination
      if (event.limit || event.offset) {
        const offset = event.offset || 0;
        const limit = event.limit || journeys.length;
        journeys = journeys.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: journeys,
        count: journeys.length,
        timestamp: new Date().toISOString(),
        metadata: {
          apiVersion: '1.0',
          entity: RabbitMQConfig.JOURNEY.ENTITY,
          filtersApplied: Object.keys(event.filters).filter(
            (k) => event.filters[k] !== undefined,
          ),
        },
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.JOURNEY.RPC.GET_BATCH} failed:`,
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
    routingKey: RabbitMQConfig.JOURNEY.RPC.VALIDATE_BOOKING, // 'rpc.validate.journey.booking'
    queue: RabbitMQConfig.JOURNEY.QUEUES.RPC_VALIDATE_BOOKING,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleValidateBookingRPC(event: {
    journeyId: string;
    bookerId: string;
    metadata?: {
      requiredCapacity?: number;
      bookingTime?: string;
    };
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.JOURNEY.RPC.VALIDATE_BOOKING} for journey ${event.journeyId}`,
    );

    try {
      const journey = await this.journeyService.getJourney(event.journeyId);

      // Validate journey is available for booking
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
        event.metadata?.requiredCapacity &&
        event.metadata.requiredCapacity > journey.capacity
      ) {
        return {
          valid: false,
          reason: `Insufficient capacity. Required: ${event.metadata.requiredCapacity}, Available: ${journey.capacity}`,
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

      // Additional business logic validations can go here
      // e.g., agent availability, location constraints, etc.

      return {
        valid: true,
        reason: 'Journey is available for booking',
        capacity: journey.capacity,
        available: true,
        price: journey.price,
        agentId: journey.agentId,
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.JOURNEY.RPC.VALIDATE_BOOKING} failed:`,
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

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.JOURNEY.RPC.QUERY_AVAILABLE, // 'rpc.query.journeys.available'
    queue: RabbitMQConfig.JOURNEY.QUEUES.RPC_QUERY_AVAILABLE,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleQueryAvailableJourneysRPC(event: {
    fromLocationId?: string;
    toLocationId?: string;
    dateRange?: { from: string; to: string };
    minCapacity?: number;
    maxPrice?: number;
    agentId?: string;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.JOURNEY.RPC.QUERY_AVAILABLE} with criteria`,
      event,
    );

    try {
      // Get available journeys based on criteria
      const journeys = await this.journeyService.findAvailableJourneys({
        //   const journeys = await this.journeyService.findAvailableJourneys({
        fromLocationId: event.fromLocationId,
        toLocationId: event.toLocationId,
        dateRange: event.dateRange,
        minCapacity: event.minCapacity,
        maxPrice: event.maxPrice,
        agentId: event.agentId,
      });

      return {
        success: true,
        data: journeys,
        count: journeys.length,
        timestamp: new Date().toISOString(),
        query: event,
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.JOURNEY.RPC.QUERY_AVAILABLE} failed:`,
        error,
      );
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.JOURNEY.RPC.CHECK_CAPACITY, // 'rpc.check.journey.capacity'
    queue: RabbitMQConfig.JOURNEY.QUEUES.RPC_CHECK_CAPACITY,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleCheckCapacityRPC(event: {
    journeyId: string;
    requiredCapacity: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.JOURNEY.RPC.CHECK_CAPACITY} for journey ${event.journeyId}`,
    );

    try {
      const journey = await this.journeyService.getJourney(event.journeyId);

      const hasCapacity = journey.capacity >= event.requiredCapacity;

      return {
        hasCapacity,
        available: journey.capacity,
        total: journey.capacity, // In a real system, you might track used vs available capacity
        required: event.requiredCapacity,
        journeyId: event.journeyId,
        status: journey.status,
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.JOURNEY.RPC.CHECK_CAPACITY} failed:`,
        error,
      );
      return {
        hasCapacity: false,
        available: 0,
        total: 0,
        required: event.requiredCapacity,
        error: error.message,
      };
    }
  }

  // ==================== INTERNAL EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.JOURNEY.EVENTS.STATUS_CHANGED, // 'journey.status.changed'
    queue: RabbitMQConfig.JOURNEY.QUEUES.EVENT_STATUS_CHANGED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.JOURNEY.QUEUES.EVENT_STATUS_CHANGED,
    ),
  })
  async handleInternalJourneyStatusChanged(_event: any) {
    const event = _event.data;
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.JOURNEY.EVENTS.STATUS_CHANGED} for journey ${event.journeyId}`,
    );

    // Handle internal status change events
    // e.g., update cache, send notifications, trigger workflows

    try {
      // Example: Update journey in search index/cache
      // await this.searchService.indexJourney(event.journeyId);

      // Example: Send notification to agent
      if (event.newStatus === JourneyStatus.BOOKED) {
        // await this.notificationService.sendToAgent(
        //   event.agentId,
        //   'journey_booked',
        //   `Your journey ${event.journeyId} has been booked`
        // );
      }

      this.logger.debug(
        `Processed internal status change for journey ${event.journeyId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process internal status change for journey ${event.journeyId}:`,
        error,
      );
      // Don't throw error to avoid DLQ for internal handlers unless critical
    }
  }
}
