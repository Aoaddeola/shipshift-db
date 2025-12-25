// src/modules/step/producers/step.producer.ts
import { Injectable, Logger, Inject } from '@nestjs/common';
import { MessageBusService } from '../../../shared/rabbitmq/rabbitmq.service.js';
import { Step, StepState } from '../step.types.js';
import { StepCreateDto } from '../step-create.dto.js';
import { StepUpdateDto } from '../step-update.dto.js';
import { RabbitMQConfig } from '../../../shared/rabbitmq/config/rabbitmq.config.js';

export interface StepUpdatedEvent {
  stepId: string;
  previousState?: StepState;
  newState?: StepState;
  updatedFields: Partial<StepUpdateDto>;
  updatedAt: string;
  changedBy?: string;
  metadata?: {
    reason?: string;
    source?: string;
  };
}

export interface StepStateChangedEvent {
  stepId: string;
  shipmentId: string;
  journeyId: string;
  previousState: StepState;
  newState: StepState;
  shipmentSteps: {
    index: number;
    state: StepState;
  }[];
  reason?: string;
  changedBy: string;
  timestamp: string;
  metadata?: {
    transactionHash?: string;
    performer?: string;
    cost?: number;
    location?: { lat: number; lng: number; address?: string };
  };
}

export interface StepDeletedEvent {
  stepId: string;
  index: number;
  shipmentId: string;
  journeyId: string;
  deletedAt: string;
  deletedBy?: string;
  reason?: string;
}

export interface StepsBatchUpdatedEvent {
  shipmentId?: string;
  journeyId?: string;
  operatorId?: string;
  filterCriteria: {
    state?: StepState;
    minIndex?: number;
    maxIndex?: number;
    [key: string]: any;
  };
  updateCount: number;
  updatedFields: Partial<StepUpdateDto>;
  requestedBy: string;
  timestamp: string;
}

export interface StepPaymentProcessedEvent {
  stepId: string;
  shipmentId: string;
  amount: number;
  currency: string;
  transactionId: string;
  payerId: string;
  status: 'completed' | 'failed' | 'pending' | 'refunded';
  processedAt: string;
  metadata?: {
    paymentMethod?: string;
    fee?: number;
  };
}

export interface StepMilestoneEvent {
  stepId: string;
  milestone: 'picked_up' | 'dropped_off' | 'handed_over' | 'received';
  location?: { lat: number; lng: number; address?: string };
  performedBy?: string;
  timestamp: string;
  metadata?: {
    photos?: string[];
    notes?: string;
    verificationMethod?: string;
  };
}

@Injectable()
export class StepProducer {
  private readonly logger = new Logger(StepProducer.name);
  private readonly config = RabbitMQConfig.STEP;

  constructor(
    @Inject(MessageBusService)
    private readonly messageBus: MessageBusService,
  ) {}

  // ==================== EVENT PUBLISHING METHODS ====================

  /**
   * Publish event when a new step is created
   */
  async publishStepCreated(step: Step): Promise<boolean> {
    const event = {
      stepId: step.id,
      index: step.index,
      shipmentId: step.shipmentId,
      journeyId: step.journeyId,
      operatorId: step.operatorId,
      colonyId: step.colonyId,
      agentId: step.agentId,
      senderId: step.senderId,
      recipientId: step.recipientId,
      holderId: step.holderId,
      state: step.state,
      stepParams: {
        spCost: step.stepParams.spCost,
        spPerformer: step.stepParams.spPerformer,
        spRequester: step.stepParams.spRequester,
      },
      createdAt: step.createdAt || new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.CREATED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'step',
          'x-event-type': 'created',
          'x-step-id': step.id,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.CREATED} for step ${step.id}`,
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

  /**
   * Publish event when a step is updated
   */
  async publishStepUpdated(
    stepId: string,
    previousState: StepState,
    update: Partial<StepUpdateDto>,
    changedBy?: string,
    metadata?: {
      reason?: string;
      source?: string;
    },
  ): Promise<boolean> {
    const event: StepUpdatedEvent = {
      stepId,
      previousState,
      newState: update.state || previousState,
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
          'x-entity-type': 'step',
          'x-event-type': 'updated',
          'x-step-id': stepId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.UPDATED} for step ${stepId}`,
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

  /**
   * Publish event when step state changes
   */
  async publishStepStateChanged(
    stepId: string,
    shipmentId: string,
    journeyId: string,
    shipmentSteps: {
      index: number;
      state: StepState;
    }[],
    previousState: StepState,
    newState: StepState,
    changedBy: string,
    metadata?: {
      transactionHash?: string;
      performer?: string;
      cost?: number;
      location?: { lat: number; lng: number; address?: string };
      reason?: string;
    },
  ): Promise<boolean> {
    const event: StepStateChangedEvent = {
      stepId,
      shipmentId,
      journeyId,
      previousState,
      shipmentSteps,
      newState,
      changedBy,
      timestamp: new Date().toISOString(),
      metadata,
    };

    try {
      // Main state change event
      await this.messageBus.emitEvent(this.config.EVENTS.STATE_CHANGED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'step',
          'x-event-type': 'state_changed',
          'x-step-id': stepId,
          'x-previous-state': StepState[previousState],
          'x-new-state': StepState[newState],
        },
      });

      // Specific state events
      if (newState === StepState.COMPLETED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.COMPLETED,
          { ...event, completedAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      } else if (newState === StepState.CANCELLED) {
        await this.messageBus.emitEvent(
          this.config.EVENTS.CANCELLED,
          { ...event, cancelledAt: new Date().toISOString() },
          { exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS },
        );
      }

      this.logger.log(
        `Published ${this.config.EVENTS.STATE_CHANGED}: ${StepState[previousState]} → ${StepState[newState]} for step ${stepId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.STATE_CHANGED}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Publish event when a step is deleted
   */
  async publishStepDeleted(
    stepId: string,
    index: number,
    shipmentId: string,
    journeyId: string,
    deletedBy?: string,
    reason?: string,
  ): Promise<boolean> {
    const event: StepDeletedEvent = {
      stepId,
      index,
      shipmentId,
      journeyId,
      deletedAt: new Date().toISOString(),
      deletedBy,
      reason,
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.DELETED, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'step',
          'x-event-type': 'deleted',
          'x-step-id': stepId,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.DELETED} for step ${stepId}`,
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

  /**
   * Publish event when multiple steps are updated in batch
   */
  async publishStepsBatchUpdated(
    updateCount: number,
    filterCriteria: {
      shipmentId?: string;
      journeyId?: string;
      operatorId?: string;
      state?: StepState;
      minIndex?: number;
      maxIndex?: number;
      [key: string]: any;
    },
    updatedFields: Partial<StepUpdateDto>,
    requestedBy: string,
  ): Promise<boolean> {
    const event: StepsBatchUpdatedEvent = {
      shipmentId: filterCriteria.shipmentId,
      journeyId: filterCriteria.journeyId,
      operatorId: filterCriteria.operatorId,
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
          'x-entity-type': 'step',
          'x-event-type': 'batch_updated',
          'x-update-count': updateCount.toString(),
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.BATCH_UPDATED} for ${updateCount} steps`,
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

  /**
   * Publish event when step payment is processed
   */
  async publishStepPaymentProcessed(
    stepId: string,
    shipmentId: string,
    amount: number,
    currency: string,
    transactionId: string,
    payerId: string,
    status: 'completed' | 'failed' | 'pending' | 'refunded',
    metadata?: {
      paymentMethod?: string;
      fee?: number;
    },
  ): Promise<boolean> {
    const event: StepPaymentProcessedEvent = {
      stepId,
      shipmentId,
      amount,
      currency,
      transactionId,
      payerId,
      status,
      processedAt: new Date().toISOString(),
      metadata,
    };

    try {
      const routingKey =
        status === 'completed'
          ? this.config.EVENTS.PAYMENT_PROCESSED
          : `${this.config.EVENTS.PAYMENT_PROCESSED}.${status}`;

      await this.messageBus.emitEvent(routingKey, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-entity-type': 'step',
          'x-event-type': 'payment_processed',
          'x-step-id': stepId,
          'x-payment-status': status,
        },
      });

      this.logger.log(`Published ${routingKey} for step ${stepId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish payment processed event:`, error);
      return false;
    }
  }

  // ==================== COMMAND PUBLISHING METHODS ====================

  /**
   * Send a command to process a step
   */
  async sendProcessStepCommand(
    stepId: string,
    action: 'start' | 'complete' | 'cancel' | 'delegate',
    performerId: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      stepId,
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
          'x-command-id': `cmd_${Date.now()}_${stepId}`,
          'x-step-id': stepId,
        },
      });
      this.logger.log(
        `Sent ${this.config.COMMANDS.PROCESS} for step ${stepId}`,
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

  /**
   * Send a command to assign an operator to a step
   */
  async sendAssignAgentCommand(
    stepId: string,
    agentId: string,
    assignedBy: string,
  ): Promise<boolean> {
    const command = {
      stepId,
      agentId,
      assignedBy,
      assignedAt: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.ASSIGN_AGENT,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${stepId}`,
            'x-step-id': stepId,
            'x-operator-id': agentId,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.ASSIGN_AGENT} for step ${stepId}`,
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

  /**
   * Send a command to update step state
   */
  async sendUpdateStateCommand(
    stepId: string,
    newState: StepState,
    requestedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const command = {
      stepId,
      newState,
      requestedBy,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.UPDATE_STATE,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${stepId}`,
            'x-step-id': stepId,
            'x-new-state': StepState[newState],
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.UPDATE_STATE} for step ${stepId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.UPDATE_STATE}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send a command to validate step transition
   */
  async sendValidateTransitionCommand(
    stepId: string,
    targetState: StepState,
    requestedBy: string,
  ): Promise<boolean> {
    const command = {
      stepId,
      targetState,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand(
        this.config.COMMANDS.VALIDATE_TRANSITION,
        command,
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
          headers: {
            'x-command-version': '1.0',
            'x-command-id': `cmd_${Date.now()}_${stepId}`,
            'x-step-id': stepId,
            'x-target-state': StepState[targetState],
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.VALIDATE_TRANSITION} for step ${stepId}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send ${this.config.COMMANDS.VALIDATE_TRANSITION}:`,
        error,
      );
      return false;
    }
  }

  // ==================== RPC METHODS ====================

  /**
   * Make RPC call to get steps with complex filtering
   */
  async rpcGetSteps(filters: any): Promise<any> {
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

  /**
   * Make RPC call to validate if a step can transition to a new state
   */
  async rpcValidateStepTransition(
    stepId: string,
    targetState: StepState,
    performerId: string,
  ): Promise<{ valid: boolean; reason?: string; allowedStates?: StepState[] }> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.VALIDATE_TRANSITION,
        { stepId, targetState, performerId },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${stepId}`,
            'x-step-id': stepId,
          },
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return response;
    } catch (error) {
      this.logger.error(
        `RPC call ${this.config.RPC.VALIDATE_TRANSITION} failed:`,
        error,
      );
      return {
        valid: false,
        reason: 'RPC call failed. Service unavailable.',
        allowedStates: [],
      };
    }
  }

  /**
   * Make RPC call to get a specific step
   */
  async rpcGetStep(stepId: string, include?: string[]): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.GET,
        { stepId, include },
        {
          exchange: RabbitMQConfig.EXCHANGES.APP_RPC,
          timeout: 5000,
          headers: {
            'x-rpc-version': '1.0',
            'x-request-id': `req_${Date.now()}_${stepId}`,
            'x-step-id': stepId,
          },
        },
      );
      return response;
    } catch (error) {
      this.logger.error(`RPC call ${this.config.RPC.GET} failed:`, error);
      throw error;
    }
  }

  /**
   * Make RPC call to create a step
   */
  async rpcCreateStep(
    stepData: StepCreateDto,
    createdBy?: string,
  ): Promise<any> {
    try {
      const response = await this.messageBus.sendRPC(
        this.config.RPC.CREATE,
        { stepData, createdBy },
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
      this.logger.error(`RPC call ${this.config.RPC.CREATE} failed:`, error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Publish step milestone events
   */
  async publishStepMilestone(
    stepId: string,
    milestone: 'picked_up' | 'dropped_off' | 'handed_over' | 'received',
    location?: { lat: number; lng: number; address?: string },
    performedBy?: string,
    metadata?: {
      photos?: string[];
      notes?: string;
      verificationMethod?: string;
    },
  ): Promise<boolean> {
    const event: StepMilestoneEvent = {
      stepId,
      milestone,
      location,
      performedBy,
      timestamp: new Date().toISOString(),
      metadata,
    };

    try {
      const routingKey =
        milestone === 'picked_up'
          ? this.config.EVENTS.MILESTONE.PICKED_UP
          : milestone === 'dropped_off'
            ? this.config.EVENTS.MILESTONE.DROPPED_OFF
            : RabbitMQConfig.Utils.eventRoutingKey(
                'step',
                `milestone.${milestone}`,
              );

      await this.messageBus.emitEvent(routingKey, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-milestone-type': milestone,
          'x-step-id': stepId,
        },
      });

      this.logger.log(`Published ${routingKey} for step ${stepId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish milestone event:`, error);
      return false;
    }
  }

  /**
   * Notify when step is ready for the next phase
   */
  async publishStepReady(
    stepId: string,
    nextPhase: string,
    readyBy: string,
  ): Promise<boolean> {
    const event = {
      stepId,
      nextPhase,
      readyBy,
      readyAt: new Date().toISOString(),
    };

    try {
      await this.messageBus.emitEvent(this.config.EVENTS.READY, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-step-id': stepId,
          'x-next-phase': nextPhase,
        },
      });
      this.logger.log(
        `Published ${this.config.EVENTS.READY} for step ${stepId}, next phase: ${nextPhase}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to publish ${this.config.EVENTS.READY}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Send notification command to stakeholders
   */
  async sendNotifyStakeholdersCommand(
    stepId: string,
    stakeholders: string[],
    notificationType: 'status_update' | 'milestone' | 'payment' | 'issue',
    message: string,
    sentBy: string,
  ): Promise<boolean> {
    const command = {
      stepId,
      stakeholders,
      notificationType,
      message,
      sentBy,
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
            'x-command-id': `cmd_${Date.now()}_${stepId}`,
            'x-step-id': stepId,
            'x-notification-type': notificationType,
          },
        },
      );
      this.logger.log(
        `Sent ${this.config.COMMANDS.NOTIFY_STAKEHOLDERS} for step ${stepId}`,
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

  /**
   * Send batch update command
   */
  async sendBatchUpdateCommand(
    filter: {
      shipmentId?: string;
      journeyId?: string;
      operatorId?: string;
      state?: StepState;
      minIndex?: number;
      maxIndex?: number;
    },
    update: StepUpdateDto,
    requestedBy: string,
  ): Promise<boolean> {
    const command = {
      filter,
      update,
      requestedBy,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.messageBus.sendCommand('batch.update.steps', command, {
        exchange: RabbitMQConfig.EXCHANGES.APP_COMMANDS,
        headers: {
          'x-command-version': '1.0',
          'x-command-id': `cmd_${Date.now()}_batch`,
        },
      });
      this.logger.log(`Sent batch.update.steps command`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send batch.update.steps command:`, error);
      return false;
    }
  }

  /**
   * Publish step assigned event
   */
  async publishStepAssigned(
    stepId: string,
    assigneeId: string,
    assigneeType: 'operator' | 'agent' | 'colony',
    assignedBy: string,
  ): Promise<boolean> {
    const event = {
      stepId,
      assigneeId,
      assigneeType,
      assignedBy,
      assignedAt: new Date().toISOString(),
    };

    try {
      const routingKey =
        assigneeType === 'operator'
          ? this.config.EVENTS.ASSIGNED
          : `step.assigned.${assigneeType}`;

      await this.messageBus.emitEvent(routingKey, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-step-id': stepId,
          'x-assignee-type': assigneeType,
        },
      });

      this.logger.log(`Published ${routingKey} for step ${stepId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish assigned event:`, error);
      return false;
    }
  }

  /**
   * Publish step unassigned event
   */
  async publishStepUnassigned(
    stepId: string,
    unassignedFromId: string,
    unassignedFromType: 'operator' | 'agent' | 'colony',
    unassignedBy: string,
    reason?: string,
  ): Promise<boolean> {
    const event = {
      stepId,
      unassignedFromId,
      unassignedFromType,
      unassignedBy,
      reason,
      unassignedAt: new Date().toISOString(),
    };

    try {
      const routingKey =
        unassignedFromType === 'operator'
          ? this.config.EVENTS.UNASSIGNED
          : `step.unassigned.${unassignedFromType}`;

      await this.messageBus.emitEvent(routingKey, event, {
        exchange: RabbitMQConfig.EXCHANGES.APP_EVENTS,
        headers: {
          'x-event-version': '1.0',
          'x-step-id': stepId,
          'x-unassigned-from-type': unassignedFromType,
        },
      });

      this.logger.log(`Published ${routingKey} for step ${stepId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to publish unassigned event:`, error);
      return false;
    }
  }
}
