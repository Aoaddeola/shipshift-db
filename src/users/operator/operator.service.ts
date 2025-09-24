import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Operator } from './operator.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { OperatorCreateDto } from './operator-create.dto.js';
import { OperatorUpdateDto } from './operator-update.dto.js';

@Injectable()
export class OperatorService {
  private readonly logger = new Logger(OperatorService.name);

  constructor(
    @InjectDatabase('operator') private database: Database<Operator>,
  ) {}

  async createOperator(
    operator: Omit<Operator, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Operator> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating operator: ${id}`);
    const newOperator: Operator = {
      id,
      createdAt: now,
      updatedAt: now,
      ...operator,
    };

    await this.database.put(newOperator);
    return newOperator;
  }

  async getOperator(id: string): Promise<Operator> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Operator not found');
    }
    return entry;
  }

  async getOperatorByAddress(walletAddress: string): Promise<Operator> {
    const all = await this.database.all();
    const operator = all.find((op) => op.walletAddress === walletAddress);
    if (!operator) {
      throw new NotFoundException(
        'Operator with this wallet address not found',
      );
    }
    return operator;
  }

  async getOperatorsByContact(contactDetailsId: string): Promise<Operator[]> {
    const all = await this.database.all();
    return all.filter((op) => op.contactDetailsId === contactDetailsId);
  }

  async getOperatorsByColonyNode(colonyNodeId: string): Promise<Operator[]> {
    const all = await this.database.all();
    return all.filter((op) => op.colonyNodeId === colonyNodeId);
  }

  async getOperatorsByContactAndColonyNode(
    contactDetailsId: string,
    colonyNodeId: string,
  ): Promise<Operator[]> {
    const all = await this.database.all();
    return all.filter(
      (op) =>
        op.contactDetailsId === contactDetailsId &&
        op.colonyNodeId === colonyNodeId,
    );
  }

  async updateOperator(
    id: string,
    operator: OperatorCreateDto,
  ): Promise<Operator> {
    // First check if operator exists
    await this.getOperator(id);

    const now = new Date().toISOString();

    // Create updated operator with ID preserved
    const updatedOperator: Operator = {
      id,
      createdAt: now,
      updatedAt: now,
      ...operator,
    };

    this.logger.log(`Updating operator: ${id}`);
    await this.database.put(updatedOperator);
    return updatedOperator;
  }

  async partialUpdateOperator(
    id: string,
    update: OperatorUpdateDto,
  ): Promise<Operator> {
    const existingOperator = await this.getOperator(id);
    const now = new Date().toISOString();

    // Create updated operator by merging existing with update
    const updatedOperator = {
      ...existingOperator,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating operator: ${id}`);
    await this.database.put(updatedOperator);
    return updatedOperator;
  }

  async getOperators(): Promise<Operator[]> {
    return this.database.all();
  }

  async deleteOperator(id: string): Promise<{ message: string }> {
    const operator = await this.getOperator(id);
    await this.database.del(id);
    return {
      message: `Operator with wallet address ${operator.walletAddress} deleted successfully`,
    };
  }
}
