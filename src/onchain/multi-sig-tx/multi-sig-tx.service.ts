import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { MultiSigTx } from './multi-sig-tx.types.js';
import { Database } from '../../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { MultiSigTxCreateDto } from './multi-sig-tx-create.dto.js';
import { MultiSigTxUpdateDto } from './multi-sig-tx-update.dto.js';

@Injectable()
export class MultiSigTxService {
  private readonly logger = new Logger(MultiSigTxService.name);

  constructor(
    @InjectDatabase('multi-sig-tx') private database: Database<MultiSigTx>,
  ) {}

  async createMultiSigTx(
    multiSigTx: Omit<
      MultiSigTx,
      'id' | 'createdAt' | 'updatedAt' | 'signatures' | 'status'
    >,
  ): Promise<MultiSigTx> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating multi-sig transaction: ${id}`);
    const newMultiSigTx: MultiSigTx = {
      id,
      createdAt: now,
      updatedAt: now,
      signatures: {},
      status: 'pending',
      ...multiSigTx,
    };

    await this.database.put(newMultiSigTx);
    return newMultiSigTx;
  }

  async getMultiSigTx(id: string, include?: string[]): Promise<MultiSigTx> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Multi-sig transaction not found');
    }

    return this.populateRelations(entry, include);
  }

  async getMultiSigTxByTxId(
    txId: string,
    include?: string[],
  ): Promise<MultiSigTx[]> {
    const all = await this.database.all();
    const multiSigTxs = all.filter((multiSigTx) => multiSigTx.txId === txId);

    return Promise.all(
      multiSigTxs.map((multiSigTx) =>
        this.populateRelations(multiSigTx, include),
      ),
    );
  }

  async getMultiSigTxs(
    filters: any = {},
    include?: string[],
  ): Promise<MultiSigTx[]> {
    const all = await this.database.all();

    let filteredMultiSigTxs = all;

    if (filters.entityDbName) {
      filteredMultiSigTxs = filteredMultiSigTxs.filter(
        (multiSigTx) => multiSigTx.entityDbName === filters.entityDbName,
      );
    }

    if (filters.entityId) {
      filteredMultiSigTxs = filteredMultiSigTxs.filter(
        (multiSigTx) => multiSigTx.entityId === filters.entityId,
      );
    }

    if (filters.status) {
      filteredMultiSigTxs = filteredMultiSigTxs.filter(
        (multiSigTx) => multiSigTx.status === filters.status,
      );
    }

    return Promise.all(
      filteredMultiSigTxs.map((multiSigTx) =>
        this.populateRelations(multiSigTx, include),
      ),
    );
  }

  async getMultiSigTxsByEntity(
    entityDbName: string,
    entityId: string,
    include?: string[],
  ): Promise<MultiSigTx[]> {
    const all = await this.database.all();
    const multiSigTxs = all.filter(
      (multiSigTx) =>
        multiSigTx.entityDbName === entityDbName &&
        multiSigTx.entityId === entityId,
    );

    return Promise.all(
      multiSigTxs.map((multiSigTx) =>
        this.populateRelations(multiSigTx, include),
      ),
    );
  }

  async getMultiSigTxsByStatus(
    status: string,
    include?: string[],
  ): Promise<MultiSigTx[]> {
    const all = await this.database.all();
    const multiSigTxs = all.filter(
      (multiSigTx) => multiSigTx.status === status,
    );

    return Promise.all(
      multiSigTxs.map((multiSigTx) =>
        this.populateRelations(multiSigTx, include),
      ),
    );
  }

  private async populateRelations(
    multiSigTx: MultiSigTx,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    include?: string[],
  ): Promise<MultiSigTx> {
    // Clone the multi-sig transaction to avoid modifying the original
    const populatedMultiSigTx = { ...multiSigTx };

    // Handle signatures population (always included as part of the entity)
    // No external services needed for signatures as they're stored within the entity

    return populatedMultiSigTx;
  }

  async updateMultiSigTx(
    id: string,
    multiSigTx: MultiSigTxCreateDto,
  ): Promise<MultiSigTx> {
    // First check if multi-sig transaction exists
    await this.getMultiSigTx(id);

    const now = new Date().toISOString();

    // Create updated multi-sig transaction with ID preserved
    const updatedMultiSigTx: MultiSigTx = {
      id,
      createdAt: now,
      updatedAt: now,
      signatures: {},
      status: 'pending',
      ...multiSigTx,
    };

    this.logger.log(`Updating multi-sig transaction: ${id}`);
    await this.database.put(updatedMultiSigTx);
    return updatedMultiSigTx;
  }

  async partialUpdateMultiSigTx(
    id: string,
    update: MultiSigTxUpdateDto,
  ): Promise<MultiSigTx> {
    const existingMultiSigTx = await this.getMultiSigTx(id);
    const now = new Date().toISOString();

    // Create a copy of the signatures
    const updatedSignatures = { ...existingMultiSigTx.signatures };

    // Handle adding signatures
    if (update.addSignatures) {
      for (const sig of update.addSignatures) {
        updatedSignatures[sig.signer] = sig.signature;
      }

      // Check if we've reached the minimum signatures
      const signatureCount = Object.keys(updatedSignatures).length;
      const newStatus =
        signatureCount >= existingMultiSigTx.minimumSigners
          ? 'completed'
          : 'pending';

      // Update status if needed
      if (existingMultiSigTx.status !== newStatus) {
        existingMultiSigTx.status = newStatus;
      }
    }

    // Create updated multi-sig transaction by merging existing with update
    const updatedMultiSigTx = {
      ...existingMultiSigTx,
      ...update,
      signatures: updatedSignatures,
      updatedAt: now,
    };

    this.logger.log(`Partially updating multi-sig transaction: ${id}`);
    await this.database.put(updatedMultiSigTx);
    return updatedMultiSigTx;
  }

  async deleteMultiSigTx(id: string): Promise<{ message: string }> {
    const multiSigTx = await this.getMultiSigTx(id);
    await this.database.del(id);
    return {
      message: `Multi-sig transaction ${multiSigTx.txId} for entity ${multiSigTx.entityDbName}/${multiSigTx.entityId} deleted successfully`,
    };
  }
}
