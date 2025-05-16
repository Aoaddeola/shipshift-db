// src/colony/colony.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { ColonyInfo } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ColonyService {
  private readonly logger = new Logger(ColonyService.name);

  constructor(
    @InjectDatabase('colony') private database: Database<ColonyInfo>,
  ) {}

  async createColony(colony: Omit<ColonyInfo, 'id'>): Promise<ColonyInfo> {
    const id = randomUUID();
    this.logger.log(`Creating colony: ${id}`);
    await this.database.put({ ...colony, id });
    return { id, ...colony };
  }

  async getColony(id: string): Promise<ColonyInfo> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Colony not found');
    }
    return entry;
  }

  async getColonies(): Promise<ColonyInfo[]> {
    return this.database.all();
  }

  async deleteColony(id: string): Promise<{ message: string }> {
    const colony = await this.getColony(id);
    await this.database.del(id);
    return { message: `Colony "${colony.colonyName}" deleted successfully` };
  }
}
