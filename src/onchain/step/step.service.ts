import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { StepCreateDto } from './step-create.dto.js';
import { StepUpdateDto } from './step-update.dto.js';
import { Step, StepState } from './step.types.js';

@Injectable()
export class StepService {
  private readonly logger = new Logger(StepService.name);

  constructor(@InjectDatabase('step') private database: Database<Step>) {}

  async createStep(
    step: Omit<Step, 'id' | 'createdAt' | 'updatedAt'>,
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

  async getStep(id: string): Promise<Step> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Step not found');
    }
    return entry;
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
        ...existingStep.stepParams,
        ...update.stepParams,
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

  async getSteps(): Promise<Step[]> {
    return this.database.all();
  }

  async getStepsByShipment(shipmentId: string): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter((step) => step.shipmentId === shipmentId);
  }

  async getStepsByJourney(journeyId: string): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter((step) => step.journeyId === journeyId);
  }

  async getStepsByOperator(operatorId: string): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter((step) => step.operatorId === operatorId);
  }

  async getStepsByState(state: StepState): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter((step) => step.state === state);
  }

  async getStepsByShipmentAndJourney(
    shipmentId: string,
    journeyId: string,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) => step.shipmentId === shipmentId && step.journeyId === journeyId,
    );
  }

  async getStepsByShipmentAndOperator(
    shipmentId: string,
    operatorId: string,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) =>
        step.shipmentId === shipmentId && step.operatorId === operatorId,
    );
  }

  async getStepsByJourneyAndOperator(
    journeyId: string,
    operatorId: string,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) => step.journeyId === journeyId && step.operatorId === operatorId,
    );
  }

  async getStepsByShipmentAndState(
    shipmentId: string,
    state: StepState,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) => step.shipmentId === shipmentId && step.state === state,
    );
  }

  async getStepsByJourneyAndState(
    journeyId: string,
    state: StepState,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) => step.journeyId === journeyId && step.state === state,
    );
  }

  async getStepsByOperatorAndState(
    operatorId: string,
    state: StepState,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) => step.operatorId === operatorId && step.state === state,
    );
  }

  async getStepsByShipmentJourneyAndOperator(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId,
    );
  }

  async getStepsByAllFilters(
    shipmentId: string,
    journeyId: string,
    operatorId: string,
    state: StepState,
  ): Promise<Step[]> {
    const all = await this.database.all();
    return all.filter(
      (step) =>
        step.shipmentId === shipmentId &&
        step.journeyId === journeyId &&
        step.operatorId === operatorId &&
        step.state === state,
    );
  }

  async deleteStep(id: string): Promise<{ message: string }> {
    const step = await this.getStep(id);
    await this.database.del(id);
    return {
      message: `Step "${id}" for shipment ${step.shipmentId} deleted successfully`,
    };
  }
}
