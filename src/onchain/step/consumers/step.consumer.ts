/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { StepService } from '../step.service.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';
import { StepState } from '../step.types.js';
import { StepFactory } from '../step.factory.js';
import { ShipmentService } from '../../../logistics/shipment/shipment.service.js';

@Injectable()
export class StepConsumer {
  private readonly logger = new Logger(StepConsumer.name);

  constructor(
    @Inject(StepService)
    private readonly stepService: StepService,
    @Inject(StepFactory)
    private readonly stepFactoryService: StepFactory,
    @Inject(ShipmentService)
    private readonly shipmentService: ShipmentService,
  ) {}

  // ==================== EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.SHIPMENT.EVENTS.CREATED, // 'shipment.created'
    queue: RabbitMQConfig.STEP.QUEUES.SHIPMENT_CREATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.STEP.QUEUES.SHIPMENT_CREATED,
      {
        arguments: {
          'x-message-ttl': 300000, // 5 minutes for integration queues
        },
      },
    ),
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('StepConsumer-ShipmentCreated');
      logger.error(
        `Failed to process shipment.created:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleShipmentCreated(event: any) {
    this.logger.log(
      `Processing shipment.created for shipment ${event.data.shipmentId}`,
    );
    // Implementation...
    const _shipment = event.data;
    const shipment = await this.shipmentService.getShipment(
      _shipment.shipmentId,
      ['journey', 'mission'],
    );

    const steps = await this.stepFactoryService.stepFactory(shipment);
    await Promise.all(
      steps.map(async (step) => {
        await this.stepService.createStep(step);
      }),
    );
  }

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.JOURNEY.EVENTS.UPDATED, // 'journey.updated'
    queue: RabbitMQConfig.STEP.QUEUES.JOURNEY_UPDATED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.STEP.QUEUES.JOURNEY_UPDATED,
    ),
  })
  async handleJourneyUpdated(event: any) {
    this.logger.log(
      `Processing journey.updated for journey ${event.journeyId}`,
    );
    // Implementation...
  }

  // ==================== COMMAND HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.STEP.COMMANDS.PROCESS, // 'process.step'
    queue: RabbitMQConfig.STEP.QUEUES.COMMAND_PROCESS,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.WITH_DLQ,
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('StepConsumer-CommandProcess');
      logger.error(
        `Failed to process command ${RabbitMQConfig.STEP.COMMANDS.PROCESS}:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleProcessStepCommand(command: any) {
    this.logger.log(
      `Processing command ${RabbitMQConfig.STEP.COMMANDS.PROCESS} for step ${command.stepId}`,
    );
    // Implementation...
  }

  // ==================== RPC HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.STEP.RPC.GET_BATCH, // 'rpc.get.steps'
    queue: RabbitMQConfig.STEP.QUEUES.RPC_GET_BATCH,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetStepsRPC(event: {
    filters: any;
    include?: string[];
    limit?: number;
    offset?: number;
  }) {
    this.logger.log(
      `RPC: ${RabbitMQConfig.STEP.RPC.GET_BATCH} with filters`,
      event.filters,
    );

    try {
      let steps: any[] = [];

      // Use appropriate service method based on filters
      if (event.filters.shipmentId && event.filters.journeyId) {
        steps = await this.stepService.getStepsByShipmentAndJourney(
          event.filters.shipmentId,
          event.filters.journeyId,
          event.include,
        );
      }
      // ... other filter combinations

      // Apply pagination
      if (event.limit || event.offset) {
        const offset = event.offset || 0;
        const limit = event.limit || steps.length;
        steps = steps.slice(offset, offset + limit);
      }

      return {
        success: true,
        data: steps,
        count: steps.length,
        timestamp: new Date().toISOString(),
        metadata: {
          apiVersion: '1.0',
          entity: RabbitMQConfig.STEP.ENTITY,
        },
      };
    } catch (error) {
      this.logger.error(
        `RPC ${RabbitMQConfig.STEP.RPC.GET_BATCH} failed:`,
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

  // ==================== INTERNAL EVENT HANDLERS ====================

  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.STATE_CHANGED, // 'step.state.changed'
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_STATE_CHANGED,
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.STEP.QUEUES.EVENT_STATE_CHANGED,
      {
        arguments: {
          'x-max-priority': 5, // State changes might be high priority
        },
      },
    ),
  })
  async handleInternalStepStateChanged(event: any) {
    this.logger.log(
      `Internal: Processing ${RabbitMQConfig.STEP.EVENTS.STATE_CHANGED} for step ${event.data.stepId}`,
    );
    // Handle internal state change events (e.g., update cache, send notifications)
  }

  // Handler for Step state transition commands from other services
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.STEP.RPC.VALIDATE_TRANSITION,
    queue: RabbitMQConfig.STEP.QUEUES.RPC_VALIDATE_TRANSITION,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleStepTransitionCommand(event: {
    stepId: string;
    targetState: StepState;
    reason?: string;
    performedBy: string;
    timestamp: string;
  }) {
    this.logger.log(
      `Step transition command: ${event.stepId} -> ${StepState[event.targetState]}`,
    );

    try {
      // Get the current step
      const step = await this.stepService.getStep(event.stepId);

      // Validate state transition logic (you should implement proper business logic)
      const allowedTransitions = this.getAllowedTransitions(step.state);
      if (!allowedTransitions.includes(event.targetState)) {
        throw new Error(
          `Invalid state transition from ${StepState[step.state]} to ${StepState[event.targetState]}`,
        );
      }

      // Update the step
      await this.stepService.partialUpdateStep(event.stepId, {
        state: event.targetState,
        // You might update other fields based on the transition
      });

      this.logger.log(
        `Step ${event.stepId} transitioned to ${StepState[event.targetState]} by ${event.performedBy}`,
      );

      // You could publish an event about the successful transition
      // await this.messageBus.emitEvent('step.state.changed', {
      //   stepId: event.stepId,
      //   previousState: step.state,
      //   newState: event.targetState,
      //   changedBy: event.performedBy,
      //   timestamp: new Date().toISOString(),
      // });
    } catch (error) {
      this.logger.error(`Failed to transition step ${event.stepId}:`, error);
      throw error; // Will be handled by errorHandler
    }
  }

  // Helper method for state transition validation
  private getAllowedTransitions(currentState: StepState): StepState[] {
    // Define your state machine rules here
    const transitionMap: Record<StepState, StepState[]> = {
      [StepState.PENDING]: [
        StepState.ACCEPTED,
        StepState.CANCELLED,
        StepState.REJECTED,
      ],
      [StepState.ACCEPTED]: [StepState.INITIALIZED, StepState.CANCELLED],
      [StepState.INITIALIZED]: [
        StepState.COMMITTED,
        StepState.CANCELLED,
        StepState.REFUNDED,
      ],
      [StepState.COMMITTED]: [StepState.PICKED_UP, StepState.REFUNDED],
      [StepState.PICKED_UP]: [StepState.COMMENCED],
      [StepState.COMMENCED]: [StepState.DROPPED_OFF],
      [StepState.DROPPED_OFF]: [StepState.FULFILLED],
      [StepState.COMPLETED]: [StepState.FULFILLED],
      [StepState.FULFILLED]: [StepState.CLAIMED],
      [StepState.CLAIMED]: [StepState.COMPLETED],
      [StepState.DELEGATED]: [],
      [StepState.CANCELLED]: [],
      [StepState.REJECTED]: [], // End state
      [StepState.REFUNDED]: [], // End state
    };

    return transitionMap[currentState] || [];
  }
}
