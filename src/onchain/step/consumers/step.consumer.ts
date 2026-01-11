/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/step/consumers/step.consumer.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { RabbitRPC } from '../../../shared/rabbitmq/decorators/index.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';
import { MessageBusService } from '../../../shared/rabbitmq/rabbitmq.service.js';
import { StepService } from '../step.service.js';
import {
  StepState,
} from '../step.types.js';
import { NotificationTemplateService } from '../../../notification-template/notification-template.service.js';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { StepProducer } from '../producers/step.producer.js';

@Injectable()
export class StepConsumer {
  private readonly logger = new Logger(StepConsumer.name);
  private readonly config = RabbitMQConfig.STEP;

  constructor(
    private readonly stepService: StepService,
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
    @Inject(NotificationTemplateService)
    private readonly notificationTemplateService: NotificationTemplateService,
    @Inject(StepProducer)
    private readonly stepProducer: StepProducer,
  ) {}

  // ==================== EVENT HANDLERS ====================

  /**
   * Handle step.created event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.CREATED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_CREATED, // 'offers.integration.shipment.created.queue',
    queueOptions: RabbitMQConfig.Utils.withDLQ(
      RabbitMQConfig.STEP.QUEUES.EVENT_CREATED, // 'offers.integration.shipment.created.queue',
      {
        /* arguments: {
          'x-message-ttl': 300000,
        }, */
      },
    ),
    errorHandler: (channel, msg, error) => {
      Logger.error(
        `Failed to process ${RabbitMQConfig.STEP.EVENTS.CREATED}:`,
        error,
        'StepConsumer',
      );
      channel.nack(msg, false, false); // Don't requeue
    },
  })
  async handleStepCreated(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.CREATED} for step ${event.stepId}`,
    );

    try {
      // Handle step creation logic
      // Example: Update related entities, send notifications, etc.
      const template =
        await this.notificationTemplateService.getTemplateForEvent(
          RabbitMQConfig.STEP.EVENTS.CREATED,
        );
      // // await this.stepService.handleStepCreated(event);
      this.logger.debug(
        `Successfully processed step.created for ${event.stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing step.created for ${event.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle step.updated event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.UPDATED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_UPDATED,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleStepUpdated(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.UPDATED} for step ${event.stepId}`,
    );

    try {
      // await this.stepService.handleStepUpdated(event);
      this.logger.debug(
        `Successfully processed step.updated for ${event.stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing step.updated for ${event.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle step.state.changed event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.STATE_CHANGED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_STATE_CHANGED,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleStepStateChanged(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.STATE_CHANGED} for step ${event.stepId}: ${event.previousState} → ${event.newState}`,
    );

    try {
      // Update related entities when step state changes
      // await this.stepService.handleStepStateChanged(event);

      // If step is completed, trigger next steps
      if (event.newState === StepState.COMPLETED) {
        // await this.handleStepCompleted(event);
      }

      // If step is cancelled, handle cancellation logic
      if (event.newState === StepState.CANCELLED) {
        // await this.handleStepCancelled(event);
      }

      this.logger.debug(
        `Successfully processed state change for ${event.stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing state change for ${event.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle step.completed event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.COMPLETED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_COMPLETED,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleStepCompleted(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.COMPLETED} for step ${event.stepId}`,
    );

    try {
      // Handle completion logic
      // await this.stepService.handleStepCompleted(event);

      // Trigger next step if exists
      // await this.stepService.triggerNextStep(event.stepId);

      this.logger.debug(
        `Successfully processed step.completed for ${event.stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing step.completed for ${event.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle step.cancelled event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.CANCELLED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_CANCELLED,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleStepCancelled(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.CANCELLED} for step ${event.stepId}`,
    );

    try {
      // await this.stepService.handleStepCancelled(event);

      // Notify stakeholders about cancellation
      await this.messageBus.sendCommand(
        RabbitMQConfig.STEP.COMMANDS.NOTIFY_STAKEHOLDERS,
        {
          stepId: event.stepId,
          notificationType: 'step_cancelled',
          message: `Step ${event.stepId} has been cancelled`,
        },
        { exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS },
      );

      this.logger.debug(
        `Successfully processed step.cancelled for ${event.stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing step.cancelled for ${event.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle step.assigned event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.ASSIGNED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_ASSIGNED,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
    errorHandler: (channel, msg, error) => {
      const logger = new Logger('StepConsumer-StepAssigned');
      logger.error(
        `Failed to process step.assigned:`,
        error?.message || 'Unknown error',
      );
      channel.nack(msg, false, false);
    },
  })
  async handleStepAssigned(_event: any): Promise<void> {
    const event = _event.data;
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.ASSIGNED} for step ${event.stepId}`,
    );
  }

  /**
   * Handle steps.batch.updated event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.BATCH_UPDATED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_BATCH_UPDATED,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleStepsBatchUpdated(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.BATCH_UPDATED} for ${event.updateCount} steps`,
    );

    try {
      // await this.stepService.handleBatchUpdate(event);
      this.logger.debug(`Successfully processed batch update`);
    } catch (error) {
      this.logger.error(`Error processing batch update:`, error);
      throw error;
    }
  }

  /**
   * Handle step.payment.processed event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.PAYMENT_PROCESSED,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_PAYMENT_PROCESSED,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleStepPaymentProcessed(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.PAYMENT_PROCESSED} for step ${event.stepId}`,
    );

    try {
      // await this.stepService.handlePaymentProcessed(event);

      // If payment completed successfully, mark step as ready
      if (event.status === 'completed') {
        await this.messageBus.emitEvent(
          RabbitMQConfig.STEP.EVENTS.READY,
          {
            stepId: event.stepId,
            nextPhase: 'execution',
            readyBy: 'payment_system',
          },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      }

      this.logger.debug(`Successfully processed payment for ${event.stepId}`);
    } catch (error) {
      this.logger.error(`Error processing payment for ${event.stepId}:`, error);
      throw error;
    }
  }

  /**
   * Handle step.milestone.picked_up event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.MILESTONE.PICKED_UP,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_MILESTONE_PICKED_UP,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleMilestonePickedUp(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.MILESTONE.PICKED_UP} for step ${event.stepId}`,
    );

    try {
      // await this.stepService.handleMilestone(event);

      // Update shipment status when parcel is picked up
      await this.messageBus.emitEvent(
        RabbitMQConfig.SHIPMENT.EVENTS.PICKED_UP,
        {
          shipmentId: event.shipmentId,
          stepId: event.stepId,
          pickedUpAt: event.timestamp,
        },
        { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
      );

      this.logger.debug(
        `Successfully processed pickup milestone for ${event.stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing pickup milestone for ${event.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle step.milestone.dropped_off event
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
    routingKey: RabbitMQConfig.STEP.EVENTS.MILESTONE.DROPPED_OFF,
    queue: RabbitMQConfig.STEP.QUEUES.EVENT_MILESTONE_DROPPED_OFF,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleMilestoneDroppedOff(event: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.EVENTS.MILESTONE.DROPPED_OFF} for step ${event.stepId}`,
    );

    try {
      // await this.stepService.handleMilestone(event);

      // If this is the last step, mark shipment as delivered
      // const isLastStep = await this.stepService.isLastStep(event.stepId);
      // if (isLastStep) {
      //   await this.messageBus.emitEvent(
      //     RabbitMQConfig.SHIPMENT.EVENTS.DELIVERED,
      //     {
      //       shipmentId: event.shipmentId,
      //       deliveredAt: event.timestamp,
      //       deliveredBy: event.performedBy,
      //     },
      //     { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
      //   );
      // }

      this.logger.debug(
        `Successfully processed drop-off milestone for ${event.stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing drop-off milestone for ${event.stepId}:`,
        error,
      );
      throw error;
    }
  }

  // ==================== COMMAND HANDLERS ====================

  /**
   * Handle process.step command
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.STEP.COMMANDS.PROCESS,
    queue: RabbitMQConfig.STEP.QUEUES.COMMAND_PROCESS,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleProcessStepCommand(command: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.COMMANDS.PROCESS} for step ${command.stepId}`,
    );

    try {
      const { stepId, action, performerId, reason } = command;

      switch (action) {
        case 'start':
          // await this.stepService.startStep(stepId, performerId);
          break;
        case 'complete':
          // await this.stepService.completeStep(stepId, performerId);
          break;
        case 'cancel':
          // await this.stepService.cancelStep(stepId, performerId, reason);
          break;
        case 'delegate':
          // Handle delegation logic
          break;
        default:
          this.logger.warn(`Unknown action: ${action} for step ${stepId}`);
      }

      this.logger.debug(`Successfully processed command for step ${stepId}`);
    } catch (error) {
      this.logger.error(
        `Error processing command for step ${command.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle assign.step.agent command
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.STEP.COMMANDS.ASSIGN_AGENT,
    queue: RabbitMQConfig.STEP.QUEUES.COMMAND_ASSIGN_OPERATOR,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleAssignAgentCommand(command: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.COMMANDS.ASSIGN_AGENT} for step ${command.stepId}`,
    );

    try {
      const { stepId, agentId, assignedBy } = command;

      await this.stepService.assignAgent(stepId, agentId, assignedBy);

      // Publish assignment event
      await this.messageBus.emitEvent(
        RabbitMQConfig.STEP.EVENTS.ASSIGNED,
        {
          stepId,
          assigneeId: agentId,
          assigneeType: 'agent',
          assignedBy,
          assignedAt: new Date().toISOString(),
        },
        { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
      );

      this.logger.debug(
        `Successfully assigned agent ${agentId} to step ${stepId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error assigning agent to step ${command.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle update.step.state command
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.STEP.COMMANDS.UPDATE_STATE,
    queue: RabbitMQConfig.STEP.QUEUES.COMMAND_UPDATE_STATE,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleUpdateStateCommand(command: any): Promise<void> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.COMMANDS.UPDATE_STATE} for step ${command.stepId}`,
    );

    try {
      const { stepId, newState, requestedBy, reason } = command;

      // Validate transition first
      // const validation = await this.stepService.validateStateTransition(
      //   stepId,
      //   newState,
      //   requestedBy,
      // );

      // if (!validation.valid) {
      //   throw new Error(`Invalid state transition: ${validation.reason}`);
      // }

      // // Update state
      // const step = await this.stepService.updateStepState(
      //   stepId,
      //   newState,
      //   requestedBy,
      //   reason,
      // );

      this.logger.debug(`Successfully updated state for step ${stepId}`);
    } catch (error) {
      this.logger.error(
        `Error updating state for step ${command.stepId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Handle validate.step.transition command
   */
  @RabbitSubscribe({
    exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
    routingKey: RabbitMQConfig.STEP.COMMANDS.VALIDATE_TRANSITION,
    queue: 'steps.command.validate.transition.queue', // Note: config missing this queue
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.DEFAULT,
  })
  async handleValidateTransitionCommand(
    command: any,
  ): Promise<{ valid: boolean; reason?: string }> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.COMMANDS.VALIDATE_TRANSITION} for step ${command.stepId}`,
    );

    try {
      const { stepId, targetState, performerId } = command;

      // const validation = await this.stepService.validateStateTransition(
      //   stepId,
      //   targetState,
      //   performerId,
      // );

      return { valid: false, reason: '' };
    } catch (error) {
      this.logger.error(
        `Error validating transition for step ${command.stepId}:`,
        error,
      );
      return { valid: false, reason: error.message };
    }
  }

  // ==================== RPC HANDLERS ====================

  /**
   * Handle rpc.get.step RPC request
   */
  @RabbitRPC({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.STEP.RPC.GET,
    queue: RabbitMQConfig.STEP.QUEUES.RPC_GET,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetStepRPC(request: any): Promise<any> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.RPC.GET} for step ${request.stepId}`,
    );

    try {
      const { stepId, include } = request;

      // const step = await this.stepService.getStepById(stepId, include);

      // if (!step) {
      //   throw new Error(`Step ${stepId} not found`);
      // }

      return {
        success: true,
        // data: step,
      };
    } catch (error) {
      this.logger.error(`Error in RPC ${RabbitMQConfig.STEP.RPC.GET}:`, error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle rpc.get.steps RPC request
   */
  @RabbitRPC({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.STEP.RPC.GET_BATCH,
    queue: RabbitMQConfig.STEP.QUEUES.RPC_GET_BATCH,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleGetStepsRPC(request: any): Promise<any> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.RPC.GET_BATCH} with filters`,
    );

    try {
      const { filters } = request;

      const steps = await this.stepService.getSteps(filters);
      // const total = await this.stepService.countSteps(filters);

      return {
        success: true,
        data: steps,
        meta: {
          // total,
          count: steps.length,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error in RPC ${RabbitMQConfig.STEP.RPC.GET_BATCH}:`,
        error,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle rpc.create.step RPC request
   */
  @RabbitRPC({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.STEP.RPC.CREATE,
    queue: 'steps.rpc.create.queue', // Note: config missing this queue
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleCreateStepRPC(request: any): Promise<any> {
    this.logger.log(`Processing ${RabbitMQConfig.STEP.RPC.CREATE}`);

    try {
      const { stepData, createdBy } = request;

      const step = await this.stepService.createStep(stepData, createdBy);

      // Publish creation event
      await this.messageBus.emitEvent(
        RabbitMQConfig.STEP.EVENTS.CREATED,
        {
          stepId: step.id,
          index: step.index,
          shipmentId: step.shipmentId,
          journeyId: step.journeyId,
          state: step.state,
          createdAt: step.createdAt,
        },
        { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
      );

      return {
        success: true,
        data: step,
      };
    } catch (error) {
      this.logger.error(
        `Error in RPC ${RabbitMQConfig.STEP.RPC.CREATE}:`,
        error,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle rpc.update.step RPC request
   */
  @RabbitRPC({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.STEP.RPC.UPDATE,
    queue: 'steps.rpc.update.queue', // Note: config missing this queue
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleUpdateStepRPC(request: any): Promise<any> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.RPC.UPDATE} for step ${request.stepId}`,
    );

    try {
      const { stepId, updateData, updatedBy } = request;

      const step = await this.stepService.updateStep(
        stepId,
        updateData,
        updatedBy,
      );

      // Publish update event
      await this.messageBus.emitEvent(
        RabbitMQConfig.STEP.EVENTS.UPDATED,
        {
          stepId,
          updatedFields: updateData,
          updatedBy,
          updatedAt: new Date().toISOString(),
        },
        { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
      );

      return {
        success: true,
        data: step,
      };
    } catch (error) {
      this.logger.error(
        `Error in RPC ${RabbitMQConfig.STEP.RPC.UPDATE}:`,
        error,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Handle rpc.validate.step.transition RPC request
   */
  @RabbitRPC({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.STEP.RPC.VALIDATE_TRANSITION,
    queue: RabbitMQConfig.STEP.QUEUES.RPC_VALIDATE_TRANSITION,
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleValidateTransitionRPC(request: any): Promise<any> {
    this.logger.log(
      `Processing ${RabbitMQConfig.STEP.RPC.VALIDATE_TRANSITION} for step ${request.stepId}`,
    );

    try {
      const { stepId, targetState, performerId } = request;

      // const validation = await this.stepService.validateStateTransition(
      //   stepId,
      //   targetState,
      //   performerId,
      // );

      return {
        success: true,
        // ...validation,
      };
    } catch (error) {
      this.logger.error(
        `Error in RPC ${RabbitMQConfig.STEP.RPC.VALIDATE_TRANSITION}:`,
        error,
      );
      return {
        success: false,
        valid: false,
        reason: error.message,
      };
    }
  }

  /**
   * Handle rpc.query.steps RPC request
   */
  @RabbitRPC({
    exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
    routingKey: RabbitMQConfig.STEP.RPC.QUERY,
    queue: 'steps.rpc.query.queue', // Note: config missing this queue
    queueOptions: RabbitMQConfig.QUEUE_OPTIONS.RPC,
  })
  async handleQueryStepsRPC(request: any): Promise<any> {
    this.logger.log(`Processing ${RabbitMQConfig.STEP.RPC.QUERY}`);

    try {
      const { query, options } = request;

      // const result = await this.stepService.querySteps(query, options);

      return {
        success: true,
        // ...result,
      };
    } catch (error) {
      this.logger.error(
        `Error in RPC ${RabbitMQConfig.STEP.RPC.QUERY}:`,
        error,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
