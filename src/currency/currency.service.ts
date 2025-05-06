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
    @InjectDatabase('currency') private readonly database: Database<Currency>,
  ) {}

  async createCurrency(spCost: Omit<Currency, 'id'>): Promise<Currency> {
    const id = randomUUID();
    this.logger.log(`Creating Currency: ${id}`);
    await this.database.put({ ...spCost, id });
    return { id, ...spCost };
  }

  async getCurrency(id: string): Promise<Currency> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Currency not found');
    }
    return entry;
  }

  async currencyToGYValue(id: string): Promise<{
    [key: string]: number;
  }> {
    const currency = await this.getCurrency(id);
    const entry = {
      [`
        /* ${currency.currencySymbol}. */
        ${currency.assetClass}
      `]: currency.quantity,
    };
    return entry;
  }

  async getCurrencys(): Promise<Currency[]> {
    return this.database.all();
  }

  async deleteCurrency(id: string): Promise<{ message: string }> {
    const spCost = await this.getCurrency(id);
    await this.database.del(id);
    return { message: `Currency "${spCost.name}" deleted successfully` };
  }
}
