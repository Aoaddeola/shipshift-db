import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
  ) {}

  async createStep(
    step: Omit<
      Step,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'shipment'
      | 'journey'
      | 'operator'
      | 'colony'
    >,
  ): Promise<Step> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating step: ${id}`);
    const newStep: Step = {
      id,
      createdAt: now,
      updatedAt: now,
      ...step,
    };

    await this.database.put(newStep);
    return newStep;
  }

  async getStep(id: string, include?: string[]): Promise<Step> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Step not found');
    }

    return this.populateRelations(entry, include);
  }

  async getSteps(include?: string[]): Promise<Step[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((step) => this.populateRelations(step, include)),
    );
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

  private async populateRelations(
    step: Step,
    include?: string[],
  ): Promise<Step> {
    // Clone the step to avoid modifying the original
    const populatedStep = { ...step };

    // Handle shipment population
    if (include?.includes('shipment')) {
      try {
        const shipment = await this.shipmentService.getShipment(
          step.shipmentId,
        );
        if (shipment) {
          populatedStep.shipment = shipment;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch shipment for ${step.shipmentId}`,
          error,
        );
      }
    }

    // Handle journey population
    if (include?.includes('journey')) {
      try {
        const journey = await this.journeyService.getJourney(step.journeyId);
        if (journey) {
          populatedStep.journey = journey;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch journey for ${step.journeyId}`,
          error,
        );
      }
    }

    // Handle operator population
    if (include?.includes('operator')) {
      try {
        const operator = await this.operatorService.getOperator(
          step.operatorId,
        );
        if (operator) {
          populatedStep.operator = operator;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch operator for ${step.operatorId}`,
          error,
        );
      }
    }

    // Handle colony population
    if (include?.includes('colony')) {
      try {
        const colony = await this.colonyNodeService.getColonyNode(
          step.colonyId,
        );
        if (colony) {
          populatedStep.colony = colony;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch colony node for ${step.colonyId}`,
          error,
        );
      }
    }

    // Handle agent population
    if (include?.includes('agent')) {
      try {
        const agent = await this.agentService.getAgent(step.agentId);
        if (agent) {
          populatedStep.agent = agent;
        }
      } catch (error) {
        this.logger.warn(`Could not fetch agent for ${step.agentId}`, error);
      }
    }

    // Handle sender population
    if (include?.includes('sender')) {
      try {
        const sender = await this.userService.findById(step.senderId);
        if (sender) {
          populatedStep.sender = sender;
        }
      } catch (error) {
        this.logger.warn(`Could not fetch sender for ${step.senderId}`, error);
      }
    }

    if (include?.includes('sender')) {
      try {
        const sender = await this.userService.findById(step.senderId);
        if (sender) populatedStep.sender = sender;
      } catch (e) {
        this.logger.warn(`Could not fetch sender for ${step.senderId}`, e);
      }
    }

    if (include?.includes('recipient')) {
      try {
        const recipient = await this.userService.findById(step.recipientId);
        if (recipient) populatedStep.recipient = recipient;
      } catch (e) {
        this.logger.warn(
          `Could not fetch recipient for ${step.recipientId}`,
          e,
        );
      }
    }

    if (include?.includes('holder')) {
      try {
        const holder = await this.userService.findById(step.holderId);
        if (holder) populatedStep.holder = holder;
      } catch (e) {
        this.logger.warn(`Could not fetch holder for ${step.holderId}`, e);
      }
    }
    return populatedStep;
  }

  async updateStep(id: string, step: StepCreateDto): Promise<Step> {
    // First check if step exists
    await this.getStep(id);

    const now = new Date().toISOString();

    // Create updated step with ID preserved
    const updatedStep: Step = {
      id,
      createdAt: now,
      updatedAt: now,
      ...step,
    };

    this.logger.log(`Updating step: ${id}`);
    await this.database.put(updatedStep);
    return updatedStep;
  }

  async partialUpdateStep(id: string, update: StepUpdateDto): Promise<Step> {
    const existingStep = await this.getStep(id);
    const now = new Date().toISOString();

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
    return updatedStep;
  }

  async deleteStep(id: string): Promise<{ message: string }> {
    const step = await this.getStep(id);
    await this.database.del(id);
    return {
      message: `Step ${step.index} for shipment ${step.shipmentId} deleted successfully`,
    };
  }
}
