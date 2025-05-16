// src/operator/operator.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { Operator } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { OperatorType } from 'src/availability/types.js';

@Injectable()
export class OperatorService {
  private readonly logger = new Logger(OperatorService.name);

  constructor(
    @InjectDatabase('operator') private readonly database: Database<Operator>,
  ) {}

  async createOperator(operator: Omit<Operator, 'id'>): Promise<Operator> {
    const id = randomUUID();
    this.logger.log(`Creating operator: ${id}`);
    await this.database.put({ ...operator, id });
    return { id, ...operator };
  }

  async getOperator(id: string): Promise<Operator> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Operator not found');
    }
    return entry;
  }

  async getOperatorByAddress(address: string): Promise<Operator | undefined> {
    // // Get the database instance
    // const db = await this.database.getDb();

    // // Query for matching records
    // const records = db.query((doc) => doc.walletAddress === address);

    // // Return undefined if no matches found
    // if (records.length === 0) return undefined;

    // // Convert raw database record to Operator type
    // const rawRecord = records[0];

    // return {
    //   id: rawRecord.id,
    //   colonyId: rawRecord.colonyId,
    //   walletAddress: rawRecord.walletAddress,
    //   sessionID: rawRecord.sessionID,
    //   // Convert JSON string to OperatorType array
    //   roles: JSON.parse(rawRecord.roles) as OperatorType[],
    // };
    const records = await this.database.all();
    const entry = records.find(
      (operator: Operator) => operator.walletAddress == address,
    );
    if (!entry) {
      throw new NotFoundException('Operator not found');
    }
    return entry;
  }

  async getOperatorBySessionId(session_id: string): Promise<Operator> {
    const records = await this.database.all();
    const entry = records.find(
      (operator: Operator) => operator.sessionID == session_id,
    );
    if (!entry) {
      throw new NotFoundException('Operator not found');
    }
    return entry;
  }

  async getOperators(): Promise<Operator[]> {
    return this.database.all();
  }

  async deleteOperator(id: string): Promise<{ message: string }> {
    const operator = await this.getOperator(id);
    await this.database.del(id);
    return {
      message: `Operator "${operator.walletAddress}" deleted successfully`,
    };
  }
}
