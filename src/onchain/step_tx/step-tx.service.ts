import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { StepTxDbEntry } from './types.js';
import { randomUUID } from 'node:crypto';
import { Database } from '../../db/orbitdb/database.js';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { StepState } from '../step/step.types.js';

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
    const now = new Date();
    this.logger.log(`Creating step transaction: ${id}`);

    const entry: StepTxDbEntry = {
      ...stepTx,
      id,
      createdAt: stepTx.createdAt || now,
      updatedAt: stepTx.updatedAt || now,
    };

    await this.database.put(entry);
    return entry;
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

  // New methods for filtering
  async getStepTxsByState(state: number): Promise<StepTxDbEntry[]> {
    const all = await this.database.all();
    return all.filter((entry) => entry.state === (state as StepState));
  }

  async getStepTxsByTransactionHash(
    transactionHash: string,
  ): Promise<StepTxDbEntry[]> {
    const all = await this.database.all();
    return all.filter((entry) => entry.transactionHash === transactionHash);
  }

  async getStepTxsByStepId(stepId: string): Promise<StepTxDbEntry[]> {
    const all = await this.database.all();
    return all.filter((entry) => entry.stepId === stepId);
  }

  async getStepTxsByStateAndTransactionHash(
    state: number,
    transactionHash: string,
  ): Promise<StepTxDbEntry[]> {
    const all = await this.database.all();
    return all.filter(
      (entry) =>
        entry.state === (state as StepState) &&
        entry.transactionHash === transactionHash,
    );
  }

  async getStepTxsByStateAndStepId(
    state: number,
    stepId: string,
  ): Promise<StepTxDbEntry[]> {
    const all = await this.database.all();
    return all.filter(
      (entry) =>
        entry.state === (state as StepState) && entry.stepId === stepId,
    );
  }

  async getStepTxsByTransactionHashAndStepId(
    transactionHash: string,
    stepId: string,
  ): Promise<StepTxDbEntry[]> {
    const all = await this.database.all();
    return all.filter(
      (entry) =>
        entry.transactionHash === transactionHash && entry.stepId === stepId,
    );
  }

  async getStepTxsByAllFilters(
    state: number,
    transactionHash: string,
    stepId: string,
  ): Promise<StepTxDbEntry[]> {
    const all = await this.database.all();
    return all.filter(
      (entry) =>
        entry.state === (state as StepState) &&
        entry.transactionHash === transactionHash &&
        entry.stepId === stepId,
    );
  }
}
