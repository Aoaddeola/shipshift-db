import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { ParcelCreateDto } from './parcel-create.dto.js';
import { ParcelUpdateDto } from './parcel-update.dto.js';
import { Parcel } from './parcel.types.js';

@Injectable()
export class ParcelService {
  private readonly logger = new Logger(ParcelService.name);

  constructor(@InjectDatabase('parcel') private database: Database<Parcel>) {}

  async createParcel(parcel: Omit<Parcel, 'id'>): Promise<Parcel> {
    const id = randomUUID();
    this.logger.log(`Creating parcel: ${id}`);
    await this.database.put({ ...parcel, id });
    return { id, ...parcel };
  }

  async getParcel(id: string): Promise<Parcel> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Parcel not found');
    }
    return entry;
  }

  async updateParcel(id: string, parcel: ParcelCreateDto): Promise<Parcel> {
    // First check if parcel exists
    await this.getParcel(id);

    // Create updated parcel with ID preserved
    const updatedParcel = {
      id,
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

    // Validate update payload
    if (update.name !== undefined && update.name.length < 3) {
      throw new BadRequestException('Name must be at least 3 characters');
    }

    if (update.description !== undefined && update.description.length < 10) {
      throw new BadRequestException(
        'Description must be at least 10 characters',
      );
    }

    // Create updated parcel by merging existing with update
    const updatedParcel = {
      ...existingParcel,
      ...update,
    };

    this.logger.log(`Partially updating parcel: ${id}`);
    await this.database.put(updatedParcel);
    return updatedParcel;
  }

  async getParcels(): Promise<Parcel[]> {
    return this.database.all();
  }

  async searchParcelsByName(name: string): Promise<Parcel[]> {
    const all = await this.database.all();
    const lowerName = name.toLowerCase();
    return all.filter((parcel) =>
      parcel.name.toLowerCase().includes(lowerName),
    );
  }

  async searchParcelsByDescription(description: string): Promise<Parcel[]> {
    const all = await this.database.all();
    const lowerDesc = description.toLowerCase();
    return all.filter((parcel) =>
      parcel.description.toLowerCase().includes(lowerDesc),
    );
  }

  async searchParcelsByNameAndDescription(
    name: string,
    description: string,
  ): Promise<Parcel[]> {
    const all = await this.database.all();
    const lowerName = name.toLowerCase();
    const lowerDesc = description.toLowerCase();
    return all.filter(
      (parcel) =>
        parcel.name.toLowerCase().includes(lowerName) &&
        parcel.description.toLowerCase().includes(lowerDesc),
    );
  }

  async deleteParcel(id: string): Promise<{ message: string }> {
    const parcel = await this.getParcel(id);
    await this.database.del(id);
    return {
      message: `Parcel "${parcel.name}" deleted successfully`,
    };
  }
}
