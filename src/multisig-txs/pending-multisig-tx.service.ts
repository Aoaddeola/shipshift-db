// src/multi-sig-tx/pending-multisig-tx.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { MultiSigTx } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MultiSigTxService {
  private readonly logger = new Logger(MultiSigTxService.name);

  constructor(
    @InjectDatabase('multi-sig-tx') private database: Database<MultiSigTx>
  ) {}

  async createMultiSigTx(
    tx: Omit<MultiSigTx, 'id'>
  ): Promise<MultiSigTx> {
    const id = randomUUID();
    this.logger.log(`Creating multi-sig tx: ${id}`);
    await this.database.put({ ...tx, id });
    return { id, ...tx };
  }

  async getMultiSigTx(id: string): Promise<MultiSigTx> {
    const tx = await this.database.get(id);
    if (!tx) {
      throw new NotFoundException('Multi-sig transaction not found');
    }
    return tx;
  }

  async getMultiSigTxs(): Promise<MultiSigTx[]> {
    return this.database.all();
  }

  async deleteMultiSigTx(id: string): Promise<{ message: string }> {
    const tx = await this.getMultiSigTx(id);
    await this.database.del(id);
    return { message: `Multi-sig tx "${tx.txId}" deleted successfully` };
  }
}