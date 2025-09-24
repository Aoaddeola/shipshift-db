import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Curator } from './curator.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { CuratorCreateDto } from './curator-create.dto.js';
import { CuratorUpdateDto } from './curator-update.dto.js';

@Injectable()
export class CuratorService {
  private readonly logger = new Logger(CuratorService.name);

  constructor(@InjectDatabase('curator') private database: Database<Curator>) {}

  async createCurator(
    curator: Omit<Curator, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Curator> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating curator: ${id}`);
    const newCurator: Curator = {
      ...curator,
      id,
      createdAt: now,
      updatedAt: now,
      missionIds: curator.missionIds || [],
    };

    await this.database.put(newCurator);
    return newCurator;
  }

  async getCurator(id: string): Promise<Curator> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Curator not found');
    }
    return entry;
  }

  async updateCurator(id: string, curator: CuratorCreateDto): Promise<Curator> {
    // First check if curator exists
    await this.getCurator(id);

    const now = new Date().toISOString();

    // Create updated curator with ID preserved
    const updatedCurator: Curator = {
      ...curator,
      id,
      createdAt: now,
      updatedAt: now,
      missionIds: curator.missionIds || [],
    };

    this.logger.log(`Updating curator: ${id}`);
    await this.database.put(updatedCurator);
    return updatedCurator;
  }

  async partialUpdateCurator(
    id: string,
    update: CuratorUpdateDto,
  ): Promise<Curator> {
    const existingCurator = await this.getCurator(id);
    const now = new Date().toISOString();

    // Handle missionIds update (preserve existing if not provided)
    let updatedMissionIds = existingCurator.missionIds;
    if (update.missionIds !== undefined) {
      updatedMissionIds = update.missionIds;
    }

    // Create updated curator by merging existing with update
    const updatedCurator = {
      ...existingCurator,
      ...update,
      missionIds: updatedMissionIds,
      updatedAt: now,
    };

    this.logger.log(`Partially updating curator: ${id}`);
    await this.database.put(updatedCurator);
    return updatedCurator;
  }

  async getCurators(): Promise<Curator[]> {
    return this.database.all();
  }

  async getCuratorsByContact(contactDetailsId: string): Promise<Curator[]> {
    const all = await this.database.all();
    return all.filter(
      (curator) => curator.contactDetailsId === contactDetailsId,
    );
  }

  async getCuratorsByMission(missionId: string): Promise<Curator[]> {
    const all = await this.database.all();
    return all.filter((curator) => curator.missionIds.includes(missionId));
  }

  async getCuratorsByContactAndMission(
    contactDetailsId: string,
    missionId: string,
  ): Promise<Curator[]> {
    const all = await this.database.all();
    return all.filter(
      (curator) =>
        curator.contactDetailsId === contactDetailsId &&
        curator.missionIds.includes(missionId),
    );
  }

  async deleteCurator(id: string): Promise<{ message: string }> {
    const curator = await this.getCurator(id);
    await this.database.del(id);
    return {
      message: `Curator "${curator.name}" deleted successfully`,
    };
  }
}
