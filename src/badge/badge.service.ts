// src/colony-badge/colony-badge.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { ColonyBadgeParams } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ColonyBadgeService {
  private readonly logger = new Logger(ColonyBadgeService.name);

  constructor(
    @InjectDatabase('colony-badge') private database: Database<ColonyBadgeParams>
  ) {}

  async createColonyBadge(
    badge: Omit<ColonyBadgeParams, 'id'>
  ): Promise<ColonyBadgeParams> {
    const id = randomUUID();
    this.logger.log(`Creating colony badge: ${id}`);
    await this.database.put({ ...badge, id });
    return { id, ...badge };
  }

  async getColonyBadge(id: string): Promise<ColonyBadgeParams> {
    const badge = await this.database.get(id);
    if (!badge) {
      throw new NotFoundException('Colony badge not found');
    }
    return badge;
  }

  async getColonyBadges(): Promise<ColonyBadgeParams[]> {
    return this.database.all();
  }

  async deleteColonyBadge(id: string): Promise<{ message: string }> {
    const badge = await this.getColonyBadge(id);
    await this.database.del(id);
    return { message: `Colony badge "${badge.cbpRole}" deleted successfully` };
  }
}