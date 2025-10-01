import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Parcel, CurrencyId } from './parcel.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { ParcelCreateDto } from './parcel-create.dto.js';
import { ParcelUpdateDto } from './parcel-update.dto.js';
import { CurrencyService } from '../../common/currency/currency.service.js';

@Injectable()
export class ParcelService {
  private readonly logger = new Logger(ParcelService.name);

  constructor(
    @InjectDatabase('parcel') private database: Database<Parcel>,
    @Inject(CurrencyService)
    private currencyService: CurrencyService,
  ) {}

  async createParcel(
    parcel: Omit<Parcel, 'id' | 'createdAt' | 'updatedAt' | 'currency'>,
  ): Promise<Parcel> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating parcel: ${id}`);
    const newParcel: Parcel = {
      id,
      createdAt: now,
      updatedAt: now,
      ...parcel,
    };

    await this.database.put(newParcel);
    return newParcel;
  }

  async getParcel(id: string, include?: string[]): Promise<Parcel> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Parcel not found');
    }

    return this.populateRelations(entry, include);
  }

  async getParcels(filters: any = {}, include?: string[]): Promise<Parcel[]> {
    const all = await this.database.all();

    let filteredParcels = all;

    if (filters.currencyId) {
      filteredParcels = filteredParcels.filter(
        (parcel) => parcel.value[0] === filters.currencyId,
      );
    }

    if (filters.fragile !== undefined) {
      filteredParcels = filteredParcels.filter(
        (parcel) => parcel.handlingInfo.fragile === filters.fragile,
      );
    }

    if (filters.perishable !== undefined) {
      filteredParcels = filteredParcels.filter(
        (parcel) => parcel.handlingInfo.perishable === filters.perishable,
      );
    }

    return Promise.all(
      filteredParcels.map((parcel) => this.populateRelations(parcel, include)),
    );
  }

  async getParcelsByCurrency(
    currencyId: CurrencyId,
    include?: string[],
  ): Promise<Parcel[]> {
    const all = await this.database.all();
    const parcels = all.filter((parcel) => parcel.value[0] === currencyId);

    return Promise.all(
      parcels.map((parcel) => this.populateRelations(parcel, include)),
    );
  }

  async getFragileParcels(include?: string[]): Promise<Parcel[]> {
    const all = await this.database.all();
    const parcels = all.filter((parcel) => parcel.handlingInfo.fragile);

    return Promise.all(
      parcels.map((parcel) => this.populateRelations(parcel, include)),
    );
  }

  async getPerishableParcels(include?: string[]): Promise<Parcel[]> {
    const all = await this.database.all();
    const parcels = all.filter((parcel) => parcel.handlingInfo.perishable);

    return Promise.all(
      parcels.map((parcel) => this.populateRelations(parcel, include)),
    );
  }

  private async populateRelations(
    parcel: Parcel,
    include?: string[],
  ): Promise<Parcel> {
    // Clone the parcel to avoid modifying the original
    const populatedParcel = { ...parcel };

    // Handle currency population
    if (include?.includes('currency')) {
      try {
        const currency = await this.currencyService.getCurrency(
          parcel.value[0],
        );
        if (currency) {
          populatedParcel.currency = currency;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch currency for ${parcel.value[0]}`,
          error,
        );
      }
    }

    return populatedParcel;
  }

  async updateParcel(id: string, parcel: ParcelCreateDto): Promise<Parcel> {
    // First check if parcel exists
    await this.getParcel(id);

    const now = new Date().toISOString();

    // Create updated parcel with ID preserved
    const updatedParcel: Parcel = {
      id,
      createdAt: now,
      updatedAt: now,
      ...parcel,
    };

    this.logger.log(`Updating parcel: ${id}`);
    await this.database.put(updatedParcel);
    return updatedParcel;
  }

  async partialUpdateParcel(
    id: string,
    update: ParcelUpdateDto,
  ): Promise<Parcel> {
    const existingParcel = await this.getParcel(id);
    const now = new Date().toISOString();

    // Handle nested handlingInfo update
    let updatedHandlingInfo = existingParcel.handlingInfo;
    if (update.handlingInfo) {
      updatedHandlingInfo = {
        ...existingParcel.handlingInfo,
        ...update.handlingInfo,
      };
    }

    // Create updated parcel by merging existing with update
    const updatedParcel = {
      ...existingParcel,
      ...update,
      handlingInfo: updatedHandlingInfo,
      updatedAt: now,
    };

    this.logger.log(`Partially updating parcel: ${id}`);
    await this.database.put(updatedParcel);
    return updatedParcel;
  }

  async deleteParcel(id: string): Promise<{ message: string }> {
    const parcel = await this.getParcel(id);
    await this.database.del(id);
    return {
      message: `Parcel "${parcel.name}" with value ${parcel.value[1]} ${parcel.value[0]} deleted successfully`,
    };
  }
}
