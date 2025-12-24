/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { Step, StepState } from './step.types.js';
import { Database } from '../../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { StepCreateDto } from './step-create.dto.js';
import { StepUpdateDto } from './step-update.dto.js';
import { ShipmentService } from '../../logistics/shipment/shipment.service.js';
import { JourneyService } from '../../logistics/journey/journey.service.js';
import { OperatorService } from '../../users/operator/operator.service.js';
import { ColonyNodeService } from '../colony-node/colony-node.service.js';
import { UserService } from '../../users/user/user.service.js';
import { AgentService } from '../../profiles/agent/agent.service.js';
import { StepProducer } from './producers/step.producer.js';
import { RabbitMQConfig } from '../../shared/rabbitmq/config/rabbitmq.config.js';
import { MessageBusService } from '../../shared/rabbitmq/rabbitmq.service.js';

@Injectable()
export class StepService {
  private readonly logger = new Logger(StepService.name);

  constructor(
    @InjectDatabase('step') private database: Database<Step>,
    @Inject(ShipmentService) private shipmentService: ShipmentService,
    @Inject(JourneyService) private journeyService: JourneyService,
    @Inject(OperatorService) private operatorService: OperatorService,
    @Inject(ColonyNodeService) private colonyNodeService: ColonyNodeService,
    @Inject(AgentService) private agentService: AgentService,
    @Inject(UserService) private userService: UserService,
    @Inject(MessageBusService) private messageBusService: MessageBusService,
    @Inject(StepProducer) private stepProducer: StepProducer,
  ) {}

  // ==================== CORE CRUD OPERATIONS ====================

  async createStep(stepData: StepCreateDto, createdBy?: string): Promise<Step> {
    this.logger.log(`Creating step for shipment: ${stepData.shipmentId}`);

    // Validate dependencies exist
    await this.validateDependencies(stepData);

    const id = randomUUID();
    const now = new Date().toISOString();

    const newStep: Step = {
      id,
      createdAt: now,
      updatedAt: now,
      ...stepData,
    };

    try {
      // Save to database
      await this.database.put(newStep);
      this.logger.log(`Step created: ${id}`);

      // Publish creation event
      await this.stepProducer.publishStepCreated(newStep);

      // If step is in a non-pending state, publish state change
      if (newStep.state !== StepState.PENDING) {
        await this.stepProducer.publishStepStateChanged(
          id,
          newStep.shipmentId,
          newStep.journeyId,
          StepState.PENDING, // Previous state (implicit)
          newStep.state,
          createdBy || 'system',
        );
      }

      return newStep;
    } catch (error) {
      this.logger.error(`Failed to create step:`, error);
      throw error;
    }
  }

  async getStep(id: string, include?: string[]): Promise<Step> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException(`Step ${id} not found`);
    }

    return this.populateRelations(entry, include);
  }

  async updateStep(
    id: string,
    stepData: StepCreateDto,
    updatedBy?: string,
  ): Promise<Step> {
    // First check if step exists
    const existingStep = await this.getStep(id);
    const now = new Date().toISOString();

    // Validate dependencies exist
    await this.validateDependencies(stepData);

    // Create updated step with ID preserved
    const updatedStep: Step = {
      ...stepData,
      ...existingStep,
      id, // Preserve ID
      updatedAt: now,
    };

    this.logger.log(`Updating step: ${id}`);
    await this.database.put(updatedStep);

    // Publish update event
    await this.stepProducer.publishStepUpdated(
      id,
      existingStep.state,
      stepData,
      updatedBy || 'system',
    );

    return updatedStep;
  }

  async partialUpdateStep(
    id: string,
    update: StepUpdateDto,
    updatedBy?: string,
  ): Promise<Step> {
    const existingStep = await this.getStep(id);
    const now = new Date().toISOString();

    // Track if state is changing
    const isStateChanged =
      update.state !== undefined && update.state !== existingStep.state;

    // Handle nested stepParams update
    let updatedStepParams = existingStep.stepParams;
    if (update.stepParams) {
      updatedStepParams = {
        ...update.stepParams,
        ...existingStep.stepParams,
      };
    }

    // Create updated step by merging existing with update
    const updatedStep = {
      ...existingStep,
      ...update,
      stepParams: updatedStepParams,
      updatedAt: now,
    };

    this.logger.log(`Partially updating step: ${id}`);
    await this.database.put(updatedStep);

    // Publish update event
    await this.stepProducer.publishStepUpdated(
      id,
      existingStep.state,
      update,
      updatedBy || 'system',
    );

    // If state changed, publish specific state change event
    if (isStateChanged && update.state !== undefined) {
      await this.stepProducer.publishStepStateChanged(
        id,
        existingStep.shipmentId,
        existingStep.journeyId,
        existingStep.state,
        update.state,
        updatedBy || 'system',
      );
    }

    return updatedStep;
  }

  async deleteStep(
    id: string,
    deletedBy?: string,
  ): Promise<{ message: string }> {
    const step = await this.getStep(id);
    await this.database.del(id);

    // Publish deletion event
    await this.stepProducer.publishStepDeleted(
      id,
      step.index,
      step.shipmentId,
      step.journeyId,
      deletedBy || 'system',
    );

    this.logger.log(`Step deleted: ${id}`);

    return {
      message: `Step ${step.index} for shipment ${step.shipmentId} deleted successfully`,
    };
  }

  // ==================== STATE MANAGEMENT ====================

  async changeStepState(
    id: string,
    newState: StepState,
    changedBy: string,
    reason?: string,
    metadata?: {
      transactionHash?: string;
      performer?: string;
      cost?: number;
      location?: { lat: number; lng: number; address?: string };
    },
  ): Promise<Step> {
    const existingStep = await this.getStep(id);

    // Validate state transition
    await this.validateStateTransition(existingStep.state, newState, changedBy);

    // Update the step state
    const updatedStep = await this.partialUpdateStep(
      id,
      { state: newState },
      changedBy,
    );

    // Publish state change event with metadata
    await this.stepProducer.publishStepStateChanged(
      id,
      existingStep.shipmentId,
      existingStep.journeyId,
      existingStep.state,
      newState,
      changedBy,
      {
        reason,
        ...metadata,
      },
    );

    // Publish milestone events for specific states
    if (newState === StepState.PICKED_UP) {
      await this.stepProducer.publishStepMilestone(
        id,
        'picked_up',
        metadata?.location,
        changedBy,
      );
    } else if (newState === StepState.DROPPED_OFF) {
      await this.stepProducer.publishStepMilestone(
        id,
        'dropped_off',
        metadata?.location,
        changedBy,
      );
    }

    return updatedStep;
  }

  async processStep(
    id: string,
    action: 'start' | 'complete' | 'cancel' | 'delegate',
    performerId: string,
    reason?: string,
  ): Promise<{ success: boolean; message: string; step?: Step }> {
    try {
      // Send command via producer
      await this.stepProducer.sendProcessStepCommand(
        id,
        action,
        performerId,
        reason,
      );

      return {
        success: true,
        message: `Step processing command sent for action: ${action}`,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send process command for step ${id}:`,
        error,
      );
      return {
        success: false,
        message: `Failed to send processing command: ${error.message}`,
      };
    }
  }

  // ==================== BATCH OPERATIONS ====================

  async batchUpdateSteps(
    filter: {
      shipmentId?: string;
      journeyId?: string;
      operatorId?: string;
      colonyId?: string;
      agentId?: string;
      senderId?: string;
      state?: StepState;
      minIndex?: number;
      maxIndex?: number;
    },
    update: StepUpdateDto,
    requestedBy: string,
  ): Promise<{ updatedCount: number; steps: Step[] }> {
    const allSteps = await this.database.all();

    // Filter steps
    const filteredSteps = allSteps.filter((step) => {
      if (filter.shipmentId && step.shipmentId !== filter.shipmentId)
        return false;
      if (filter.journeyId && step.journeyId !== filter.journeyId) return false;
      if (filter.operatorId && step.operatorId !== filter.operatorId)
        return false;
      if (filter.colonyId && step.colonyId !== filter.colonyId) return false;
      if (filter.agentId && step.agentId !== filter.agentId) return false;
      if (filter.senderId && step.senderId !== filter.senderId) return false;
      if (filter.state !== undefined && step.state !== filter.state)
        return false;
      if (filter.minIndex !== undefined && step.index < filter.minIndex)
        return false;
      if (filter.maxIndex !== undefined && step.index > filter.maxIndex)
        return false;
      return true;
    });

    // Update each step
    const updatedSteps: Step[] = [];
    for (const step of filteredSteps) {
      const updatedStep = await this.partialUpdateStep(
        step.id,
        update,
        requestedBy,
      );
      updatedSteps.push(updatedStep);
    }

    // Publish batch update event
    await this.stepProducer.publishStepsBatchUpdated(
      updatedSteps.length,
      filter,
      update,
      requestedBy,
    );

    return {
      updatedCount: updatedSteps.length,
      steps: updatedSteps,
    };
  }

  // ==================== QUERY METHODS (with RabbitMQ integration) ====================

  async getSteps(include?: string[]): Promise<Step[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsWithRPC(filters: any, include?: string[]): Promise<Step[]> {
    // Use RPC to get steps from other services if needed
    try {
      const rpcResponse = await this.stepProducer.rpcGetSteps(filters);
      if (rpcResponse.success) {
        return rpcResponse.data;
      }
    } catch (error) {
      this.logger.warn(`RPC call failed, falling back to local query:`, error);
    }

    // Fallback to local query
    return this.getSteps(include);
  }

  // ==================== VALIDATION METHODS ====================

  private async validateDependencies(stepData: StepCreateDto): Promise<void> {
    const errors: string[] = [];

    // Validate shipment exists
    try {
      await this.shipmentService.getShipment(stepData.shipmentId);
    } catch {
      errors.push(`Shipment ${stepData.shipmentId} not found`);
    }

    // Validate journey exists
    try {
      await this.journeyService.getJourney(stepData.journeyId);
    } catch {
      errors.push(`Journey ${stepData.journeyId} not found`);
    }

    // Validate operator exists
    try {
      await this.operatorService.getOperator(stepData.operatorId);
    } catch {
      errors.push(`Operator ${stepData.operatorId} not found`);
    }

    // Validate colony exists
    try {
      await this.colonyNodeService.getColonyNode(stepData.colonyId);
    } catch {
      errors.push(`Colony ${stepData.colonyId} not found`);
    }

    // Validate sender exists
    try {
      await this.userService.findById(stepData.senderId);
    } catch {
      errors.push(`Sender ${stepData.senderId} not found`);
    }

    // Validate recipient exists
    try {
      await this.userService.findById(stepData.recipientId);
    } catch {
      errors.push(`Recipient ${stepData.recipientId} not found`);
    }

    // Validate holder exists
    try {
      await this.userService.findById(stepData.holderId);
    } catch {
      errors.push(`Holder ${stepData.holderId} not found`);
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        message: 'Dependency validation failed',
        errors,
      });
    }
  }

  private async validateStateTransition(
    currentState: StepState,
    targetState: StepState,
    performerId: string,
  ): Promise<void> {
    // Use RPC to validate transition with business rules
    try {
      const validation = await this.stepProducer.rpcValidateStepTransition(
        'virtual-step-id', // We don't have a specific step ID yet
        targetState,
        performerId,
      );

      if (!validation.valid) {
        throw new BadRequestException(
          validation.reason || 'Invalid state transition',
        );
      }
    } catch {
      // Fallback to basic validation
      if (
        currentState === StepState.COMPLETED &&
        targetState !== StepState.COMPLETED
      ) {
        throw new BadRequestException('Cannot modify a completed step');
      }

      if (
        currentState === StepState.CANCELLED &&
        targetState !== StepState.CANCELLED
      ) {
        throw new BadRequestException('Cannot modify a cancelled step');
      }
    }
  }

  // ==================== HELPER METHODS ====================

  private async populateRelations(
    step: Step,
    include?: string[],
  ): Promise<Step> {
    if (!include || include.length === 0) {
      return step;
    }

    // Clone the step to avoid modifying the original
    const populatedStep = { ...step };

    // Handle shipment population
    if (include.includes('shipment')) {
      try {
        const shipment = await this.shipmentService.getShipment(
          step.shipmentId,
        );
        populatedStep.shipment = shipment;
      } catch (error) {
        this.logger.warn(
          `Could not fetch shipment for ${step.shipmentId}`,
          error,
        );
      }
    }

    // Handle journey population
    if (include.includes('journey')) {
      try {
        const journey = await this.journeyService.getJourney(step.journeyId);
        populatedStep.journey = journey;
      } catch (error) {
        this.logger.warn(
          `Could not fetch journey for ${step.journeyId}`,
          error,
        );
      }
    }

    // Handle operator population
    if (include.includes('operator')) {
      try {
        const operator = await this.operatorService.getOperator(
          step.operatorId,
        );
        populatedStep.operator = operator;
      } catch (error) {
        this.logger.warn(
          `Could not fetch operator for ${step.operatorId}`,
          error,
        );
      }
    }

    // Handle colony population
    if (include.includes('colony')) {
      try {
        const colony = await this.colonyNodeService.getColonyNode(
          step.colonyId,
        );
        populatedStep.colony = colony;
      } catch (error) {
        this.logger.warn(
          `Could not fetch colony node for ${step.colonyId}`,
          error,
        );
      }
    }

    // Handle agent population
    if (include.includes('agent')) {
      try {
        const agent = await this.agentService.getAgentsByOwner(step.agentId);
        if (agent.length > 0) {
          populatedStep.agent = agent[0];
        }
      } catch (error) {
        this.logger.warn(`Could not fetch agent for ${step.agentId}`, error);
      }
    }

    // Handle sender population
    if (include.includes('sender')) {
      try {
        const sender = await this.userService.findById(step.senderId);
        populatedStep.sender = sender!;
      } catch (error) {
        this.logger.warn(`Could not fetch sender for ${step.senderId}`, error);
      }
    }

    // Handle recipient population
    if (include.includes('recipient')) {
      try {
        const recipient = await this.userService.findById(step.recipientId);
        populatedStep.recipient = recipient!;
      } catch (error) {
        this.logger.warn(
          `Could not fetch recipient for ${step.recipientId}`,
          error,
        );
      }
    }

    // Handle holder population
    if (include.includes('holder')) {
      try {
        const holder = await this.userService.findById(step.holderId);
        populatedStep.holder = holder!;
      } catch (error) {
        this.logger.warn(`Could not fetch holder for ${step.holderId}`, error);
      }
    }

    return populatedStep;
  }

  // ==================== BUSINESS LOGIC METHODS ====================

  async assignAgent(
    stepId: string,
    agentId: string,
    assignedBy: string,
  ): Promise<Step> {
    await this.getStep(stepId);

    // Send command to assign operator
    await this.stepProducer.sendAssignAgentCommand(stepId, agentId, assignedBy);

    // Update step with new agent
    return this.partialUpdateStep(stepId, { agentId }, assignedBy);
  }

  async notifyStakeholders(
    stepId: string,
    notificationType: 'status_update' | 'milestone' | 'payment' | 'issue',
    message: string,
    sentBy: string,
  ): Promise<boolean> {
    const step = await this.getStep(stepId);

    // Collect stakeholder IDs
    const stakeholders = [
      step.senderId,
      step.recipientId,
      step.holderId,
      step.agentId,
      step.operatorId,
    ].filter((id) => id);

    // Send notification via RabbitMQ
    try {
      await this.messageBusService.sendCommand(
        RabbitMQConfig.Utils.commandRoutingKey('notify', 'step'),
        {
          stepId,
          stakeholders,
          notificationType,
          message,
          sentBy,
          timestamp: new Date().toISOString(),
        },
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send notifications for step ${stepId}:`,
        error,
      );
      return false;
    }
  }

  async processPayment(
    stepId: string,
    amount: number,
    currency: string,
    transactionId: string,
    payerId: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Update step with payment info
      await this.partialUpdateStep(stepId, {
        stepParams: {
          spCost: amount,
        },
      });

      // Publish payment processed event
      await this.stepProducer.publishStepPaymentProcessed(
        stepId,
        'step-shipment-id', // You might need to get this from step
        amount,
        currency,
        transactionId,
        payerId,
        'completed',
      );

      return {
        success: true,
        message: 'Payment processed successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to process payment for step ${stepId}:`, error);

      // Publish payment failed event
      await this.stepProducer.publishStepPaymentProcessed(
        stepId,
        'step-shipment-id',
        amount,
        currency,
        transactionId,
        payerId,
        'failed',
      );

      return {
        success: false,
        message: `Payment processing failed: ${error.message}`,
      };
    }
  }

  async getStepsByShipment(
    shipmentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.shipmentId === shipmentId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourney(
    journeyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.journeyId === journeyId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperator(
    operatorId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.operatorId === operatorId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByColony(
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.colonyId === colonyId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByAgent(agentId: string, include?: string[]): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.agentId === agentId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsBySender(
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.senderId === senderId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByState(state: StepState, include?: string[]): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.state === state);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getActiveSteps(include?: string[]): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.state === StepState.INITIALIZED ||
        step.state === StepState.COMMITTED ||
        step.state === StepState.FULFILLED ||
        step.state === StepState.DROPPED_OFF ||
        step.state === StepState.COMMENCED,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAndJourney(
    shipmentId: string,
    journeyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.shipmentId === shipmentId && step.journeyId === journeyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAndOperator(
    shipmentId: string,
    operatorId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId && step.operatorId === operatorId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAndColony(
    shipmentId: string,
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.shipmentId === shipmentId && step.colonyId === colonyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAndAgent(
    shipmentId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.shipmentId === shipmentId && step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAndSender(
    shipmentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.shipmentId === shipmentId && step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAndState(
    shipmentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.shipmentId === shipmentId && step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAndOperator(
    journeyId: string,
    operatorId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.journeyId === journeyId && step.operatorId === operatorId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAndColony(
    journeyId: string,
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.journeyId === journeyId && step.colonyId === colonyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAndAgent(
    journeyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.journeyId === journeyId && step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAndSender(
    journeyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.journeyId === journeyId && step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAndState(
    journeyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.journeyId === journeyId && step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorAndColony(
    operatorId: string,
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.operatorId === operatorId && step.colonyId === colonyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorAndAgent(
    operatorId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.operatorId === operatorId && step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorAndSender(
    operatorId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.operatorId === operatorId && step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByRecipientAndHolder(
    recipientId: string,
    holderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.recipientId === recipientId && step.holderId === holderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByRecipient(
    recipientId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.recipientId === recipientId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByHolder(
    holderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter((step) => step.holderId === holderId);

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorAndState(
    operatorId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.operatorId === operatorId && step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByColonyAndAgent(
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.colonyId === colonyId && step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByColonyAndSender(
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.colonyId === colonyId && step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByColonyAndState(
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.colonyId === colonyId && step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByAgentAndSender(
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.agentId === agentId && step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByAgentAndState(
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.agentId === agentId && step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsBySenderAndState(
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) => step.senderId === senderId && step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAndOperator(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAndColony(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAndAgent(
    shipmentId: string,
    journeyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAndSender(
    shipmentId: string,
    journeyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAndState(
    shipmentId: string,
    journeyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorAndColony(
    shipmentId: string,
    operatorId: string,
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorAndAgent(
    shipmentId: string,
    operatorId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorAndSender(
    shipmentId: string,
    operatorId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorAndState(
    shipmentId: string,
    operatorId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentColonyAndAgent(
    shipmentId: string,
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.colonyId === colonyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentColonyAndSender(
    shipmentId: string,
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.colonyId === colonyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentColonyAndState(
    shipmentId: string,
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.colonyId === colonyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAgentAndSender(
    shipmentId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAgentAndState(
    shipmentId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentSenderAndState(
    shipmentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorAndColony(
    journeyId: string,
    operatorId: string,
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorAndAgent(
    journeyId: string,
    operatorId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorAndSender(
    journeyId: string,
    operatorId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorAndState(
    journeyId: string,
    operatorId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyColonyAndAgent(
    journeyId: string,
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyColonyAndSender(
    journeyId: string,
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyColonyAndState(
    journeyId: string,
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAgentAndSender(
    journeyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAgentAndState(
    journeyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneySenderAndState(
    journeyId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorColonyAndAgent(
    operatorId: string,
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorColonyAndSender(
    operatorId: string,
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorColonyAndState(
    operatorId: string,
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorAgentAndSender(
    operatorId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorAgentAndState(
    operatorId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorSenderAndState(
    operatorId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByColonyAgentAndSender(
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByColonyAgentAndState(
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByColonySenderAndState(
    colonyId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.colonyId === colonyId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByAgentSenderAndState(
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.agentId === agentId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorAndColony(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    colonyId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorAndAgent(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorAndSender(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorAndState(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyColonyAndAgent(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyColonyAndSender(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyColonyAndState(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAgentAndSender(
    shipmentId: string,
    journeyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAgentAndState(
    shipmentId: string,
    journeyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneySenderAndState(
    shipmentId: string,
    journeyId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorColonyAndAgent(
    shipmentId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorColonyAndSender(
    shipmentId: string,
    operatorId: string,
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorColonyAndState(
    shipmentId: string,
    operatorId: string,
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorAgentAndSender(
    shipmentId: string,
    operatorId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorAgentAndState(
    shipmentId: string,
    operatorId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorSenderAndState(
    shipmentId: string,
    operatorId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentColonyAgentAndSender(
    shipmentId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentColonyAgentAndState(
    shipmentId: string,
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentColonySenderAndState(
    shipmentId: string,
    colonyId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.colonyId === colonyId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentAgentSenderAndState(
    shipmentId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.agentId === agentId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorColonyAndAgent(
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorColonyAndSender(
    journeyId: string,
    operatorId: string,
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorColonyAndState(
    journeyId: string,
    operatorId: string,
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorAgentAndSender(
    journeyId: string,
    operatorId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorAgentAndState(
    journeyId: string,
    operatorId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorSenderAndState(
    journeyId: string,
    operatorId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyColonyAgentAndSender(
    journeyId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyColonyAgentAndState(
    journeyId: string,
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyColonySenderAndState(
    journeyId: string,
    colonyId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyAgentSenderAndState(
    journeyId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.agentId === agentId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorColonyAgentAndSender(
    operatorId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByOperatorColonyAgentAndState(
    operatorId: string,
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorColonyAndAgent(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorColonyAgentAndSender(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.colonyId === colonyId &&
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.senderId === senderId &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorColonyAgentAndState(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.colonyId === colonyId &&
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.state === state &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorColonySenderAndState(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.senderId === senderId &&
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.state === state &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorAgentSenderAndState(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.senderId === senderId &&
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.state === state &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyColonyAgentSenderAndState(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.senderId === senderId &&
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.state === state &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorColonyAgentSenderAndState(
    shipmentId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.senderId === senderId &&
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.state === state &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorColonyAgentSenderAndState(
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.senderId === senderId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.state === state &&
        step.agentId === agentId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorColonyAndSender(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    colonyId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorColonyAndState(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    colonyId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorAgentAndSender(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorAgentAndState(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyOperatorSenderAndState(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyColonyAgentAndSender(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyColonyAgentAndState(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyColonySenderAndState(
    shipmentId: string,
    journeyId: string,
    colonyId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.colonyId === colonyId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentJourneyAgentSenderAndState(
    shipmentId: string,
    journeyId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.agentId === agentId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorColonyAgentAndSender(
    shipmentId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByShipmentOperatorColonyAgentAndState(
    shipmentId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorColonyAgentAndSender(
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByJourneyOperatorColonyAgentAndState(
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }

  async getStepsByAllFilters(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    colonyId: string,
    agentId: string,
    senderId: string,
    state: StepState,
    include?: string[],
  ): Promise<Step[]> {
    const all = await this.database.all();
    const steps = all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.colonyId === colonyId &&
        step.agentId === agentId &&
        step.senderId === senderId &&
        step.state === state,
    );

    return Promise.all(
      steps.map((step) => this.populateRelations(step, include)),
    );
  }
}
