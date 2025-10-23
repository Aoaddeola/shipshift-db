// src/step-tx/step-tx.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StepTxDbEntry } from './types.js';
import { randomUUID } from 'node:crypto';
import { Database } from '../../db/orbitdb/database.js';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';

@Injectable()
export class StepTxService {
  private readonly logger = new Logger(StepTxService.name);

  constructor(
    @InjectDatabase('step-tx')
    private readonly database: Database<StepTxDbEntry>,
  ) {}

  async createStepTx(
    stepTx: Omit<StepTxDbEntry, 'id'>,
  ): Promise<StepTxDbEntry> {
    const id = randomUUID();
    this.logger.log(`Creating step transaction: ${id}`);
    await this.database.put({ ...stepTx, id });
    return { id, ...stepTx };
  }

  async getStepTx(id: string): Promise<StepTxDbEntry> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Step transaction not found');
    }
    return entry;
  }

  async getStepTxs(): Promise<StepTxDbEntry[]> {
    return this.database.all();
  }

  async deleteStepTx(id: string): Promise<{ message: string }> {
    const stepTx = await this.getStepTx(id);
    await this.database.del(id);
    return {
      message: `Step transaction "${stepTx.transactionHash}" deleted successfully`,
    };
  }
}
