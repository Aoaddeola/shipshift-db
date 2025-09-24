// src/pending-multisig-tx-witness/pending-multisig-tx-witness.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MultiSigWitness } from './types.js';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';

@Injectable()
export class MultiSigWitnessService {
  private readonly logger = new Logger(MultiSigWitnessService.name);

  constructor(
    @InjectDatabase('pending-multisig-tx-witness')
    private database: Database<MultiSigWitness>,
  ) {}

  async createMultiSigWitness(
    witness: Omit<MultiSigWitness, 'id'>,
  ): Promise<MultiSigWitness> {
    const id = randomUUID();
    this.logger.log(`Creating multi-sig witness: ${id}`);
    await this.database.put({ ...witness, id });
    return { id, ...witness };
  }

  async getMultiSigWitness(id: string): Promise<MultiSigWitness> {
    const witness = await this.database.get(id);
    if (!witness) {
      throw new NotFoundException('Multi-sig witness not found');
    }
    return witness;
  }

  async getMultiSigWitnesses(): Promise<MultiSigWitness[]> {
    return this.database.all();
  }

  async deleteMultiSigWitness(id: string): Promise<{ message: string }> {
    await this.getMultiSigWitness(id);
    await this.database.del(id);
    return { message: `Multi-sig witness "${id}" deleted successfully` };
  }
}
