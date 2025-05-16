// src/currency/currency.service.ts

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../orbitdb/inject-database.decorator.js';
import { Currency } from './types.js';
import { Database } from '../orbitdb/database.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectDatabase('currency') private database: Database<Currency>,
  ) {}

  async createCurrency(currency: Omit<Currency, 'id'>): Promise<Currency> {
    const id = randomUUID();
    this.logger.log(`Creating currency: ${id}`);
    await this.database.put({ ...currency, id });
    return { id, ...currency };
  }

  async getCurrency(id: string): Promise<Currency> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Currency not found');
    }
    return entry;
  }

  async getCurrencies(): Promise<Currency[]> {
    return this.database.all();
  }

  async deleteCurrency(id: string): Promise<{ message: string }> {
    const currency = await this.getCurrency(id);
    await this.database.del(id);
    return {
      message: `Currency "${currency.userFriendlyName}" deleted successfully`,
    };
  }
}
