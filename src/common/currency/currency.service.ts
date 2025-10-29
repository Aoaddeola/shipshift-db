import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Currency } from './currency.types.js';
import { randomUUID } from 'node:crypto';
import { CurrencyCreateDto } from './currency-create.dto.js';
import { CurrencyUpdateDto } from './currency-update.dto.js';
import { Database } from '../../db/orbitdb/database.js';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);

  constructor(
    @InjectDatabase('currency') private database: Database<Currency>,
  ) {}

  async createCurrency(
    currency: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Currency> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating currency: ${id}`);
    const newCurrency: Currency = {
      id,
      createdAt: now,
      updatedAt: now,
      ...currency,
    };

    await this.database.put(newCurrency);
    return newCurrency;
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

  async getCurrenciesByStableCoinStatus(
    isStableCoin: boolean,
  ): Promise<Currency[]> {
    const all = await this.database.all();
    return all.filter((currency) => currency.isStableCoin === isStableCoin);
  }

  async getCurrencyBySymbol(currencySymbol: string): Promise<Currency> {
    const all = await this.database.all();
    const currency = all.find((c) => c.currencySymbol === currencySymbol);

    if (!currency) {
      throw new NotFoundException(
        `Currency with symbol ${currencySymbol} not found`,
      );
    }

    return currency;
  }

  async getCurrencyByAssetClass(assetClass: string): Promise<Currency> {
    const all = await this.database.all();
    let currency: Currency | undefined;
    try {
      const currencySymbol = assetClass.split('.')[0];
      const tokenName = assetClass.split('.')[1];
      currency = all.find(
        (c) => c.currencySymbol === currencySymbol && c.tokenName === tokenName,
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new BadRequestException(
        `Invalid asset class provided: ${assetClass}. Ensure it is in the format "currencySymbol.tokenName" `,
      );
    }

    if (!currency) {
      throw new NotFoundException(
        `Currency with symbol ${assetClass} not found`,
      );
    }

    return currency;
  }

  async updateCurrency(
    id: string,
    currency: CurrencyCreateDto,
  ): Promise<Currency> {
    // First check if currency exists
    await this.getCurrency(id);

    const now = new Date().toISOString();

    // Create updated currency with ID preserved
    const updatedCurrency: Currency = {
      id,
      createdAt: now,
      updatedAt: now,
      ...currency,
    };

    this.logger.log(`Updating currency: ${id}`);
    await this.database.put(updatedCurrency);
    return updatedCurrency;
  }

  async partialUpdateCurrency(
    id: string,
    update: CurrencyUpdateDto,
  ): Promise<Currency> {
    const existingCurrency = await this.getCurrency(id);
    const now = new Date().toISOString();

    // Create updated currency by merging existing with update
    const updatedCurrency = {
      ...existingCurrency,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating currency: ${id}`);
    await this.database.put(updatedCurrency);
    return updatedCurrency;
  }

  async deleteCurrency(id: string): Promise<{ message: string }> {
    const currency = await this.getCurrency(id);
    await this.database.del(id);
    return {
      message: `Currency "${currency.currencySymbol}" (${currency.userFriendlyName}) deleted successfully`,
    };
  }
}
