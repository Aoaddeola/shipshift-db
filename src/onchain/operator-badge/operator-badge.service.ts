import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { OperatorBadge } from './operator-badge.types.js';
import { Database } from '../../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { OperatorBadgeCreateDto } from './operator-badge-create.dto.js';
import { OperatorBadgeUpdateDto } from './operator-badge-update.dto.js';

@Injectable()
export class OperatorBadgeService {
  private readonly logger = new Logger(OperatorBadgeService.name);

  constructor(
    @InjectDatabase('operator-badge') private database: Database<OperatorBadge>,
  ) {}

  async createOperatorBadge(
    operatorBadge: Omit<OperatorBadge, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OperatorBadge> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating operator badge: ${id}`);
    const newOperatorBadge: OperatorBadge = {
      id,
      createdAt: now,
      updatedAt: now,
      ...operatorBadge,
    };

    await this.database.put(newOperatorBadge);
    return newOperatorBadge;
  }

  async getOperatorBadge(id: string): Promise<OperatorBadge> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Operator badge not found');
    }
    return entry;
  }

  async updateOperatorBadge(
    id: string,
    operatorBadge: OperatorBadgeCreateDto,
  ): Promise<OperatorBadge> {
    // First check if operator badge exists
    await this.getOperatorBadge(id);

    const now = new Date().toISOString();

    // Create updated operator badge with ID preserved
    const updatedOperatorBadge: OperatorBadge = {
      id,
      createdAt: now,
      ...operatorBadge,
      updatedAt: now,
    };

    this.logger.log(`Updating operator badge: ${id}`);
    await this.database.put(updatedOperatorBadge);
    return updatedOperatorBadge;
  }

  async partialUpdateOperatorBadge(
    id: string,
    update: OperatorBadgeUpdateDto,
  ): Promise<OperatorBadge> {
    const existingOperatorBadge = await this.getOperatorBadge(id);
    const now = new Date().toISOString();

    // Create updated operator badge by merging existing with update
    const updatedOperatorBadge = {
      ...existingOperatorBadge,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating operator badge: ${id}`);
    await this.database.put(updatedOperatorBadge);
    return updatedOperatorBadge;
  }

  async getOperatorBadges(): Promise<OperatorBadge[]> {
    return this.database.all();
  }

  async getOperatorBadgesByStepAddress(
    stepAddress: string,
  ): Promise<OperatorBadge[]> {
    const all = await this.database.all();
    return all.filter((badge) => badge.stepAddress === stepAddress);
  }

  async getOperatorBadgesByWalletAddress(
    walletAddress: string,
  ): Promise<OperatorBadge[]> {
    const all = await this.database.all();
    return all.filter((badge) => badge.walletAddress === walletAddress);
  }

  async getOperatorBadgesByOpWalletAddress(
    walletAddress: string,
  ): Promise<OperatorBadge[]> {
    const all = await this.database.all();
    return all.filter((badge) => badge.walletAddress === walletAddress);
  }

  async getOperatorBadgesByPolicy(policyId: string): Promise<OperatorBadge[]> {
    const all = await this.database.all();
    return all.filter(
      (badge) => badge.policyId === policyId || badge.stepPolicyId === policyId,
    );
  }

  async getOperatorBadgesByStepAddressAndPolicy(
    stepAddress: string,
    policyId: string,
  ): Promise<OperatorBadge[]> {
    const all = await this.database.all();
    return all.filter(
      (badge) =>
        badge.stepAddress === stepAddress &&
        (badge.policyId === policyId || badge.stepPolicyId === policyId),
    );
  }

  async deleteOperatorBadge(id: string): Promise<{ message: string }> {
    const operatorBadge = await this.getOperatorBadge(id);
    await this.database.del(id);
    return {
      message: `Operator badge with step address ${operatorBadge.stepAddress} deleted successfully`,
    };
  }
}
