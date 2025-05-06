// src/colony/colony.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { ColonyParams } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ColonyService {
  private readonly logger = new Logger(ColonyService.name);

  constructor(
    @InjectDatabase('colony') private readonly database: Database<ColonyParams>,
  ) {}

  async createColony(colony: Omit<ColonyParams, 'id'>): Promise<ColonyParams> {
    const id = randomUUID();
    this.logger.log(`Creating colony: ${id}`);
    await this.database.put({ ...colony, id });
    return { id, ...colony };
  }

  async getColony(id: string): Promise<ColonyParams> {
    const colony = await this.database.get(id);
    if (!colony) {
      throw new NotFoundException('Colony not found');
    }
    return colony;
  }

  async getColonies(): Promise<ColonyParams[]> {
    return this.database.all();
  }

  async deleteColony(id: string): Promise<{ message: string }> {
    const colony = await this.getColony(id);
    await this.database.del(id);
    return { message: `Colony "${colony.cpTxOutRef}" deleted successfully` };
  }
}
