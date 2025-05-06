// src/step/step.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { StepParams } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class StepService {
  private readonly logger = new Logger(StepService.name);

  constructor(@InjectDatabase('step') private database: Database<StepParams>) {}

  async createStep(step: Omit<StepParams, 'id'>): Promise<StepParams> {
    const id = randomUUID();
    this.logger.log(`Creating step: ${id}`);
    await this.database.put({ ...step, id });
    return { id, ...step };
  }

  async getStep(id: string): Promise<StepParams> {
    const step = await this.database.get(id);
    if (!step) {
      throw new NotFoundException('Step not found');
    }
    return step;
  }

  async getSteps(): Promise<StepParams[]> {
    return this.database.all();
  }

  async deleteStep(id: string): Promise<{ message: string }> {
    const step = await this.getStep(id);
    await this.database.del(id);
    return { message: `Step "${step.spTxOutRef}" deleted successfully` };
  }
}