import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Curator } from './curator.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { CuratorCreateDto } from './curator-create.dto.js';
import { CuratorUpdateDto } from './curator-update.dto.js';
import { ContactDetailsService } from '../../common/contact-details/contact-details.service.js';

@Injectable()
export class CuratorService {
  private readonly logger = new Logger(CuratorService.name);

  constructor(
    @InjectDatabase('curator') private database: Database<Curator>,
    @Inject(ContactDetailsService)
    private contactDetailsDatabase: ContactDetailsService,
  ) {}

  async createCurator(
    curator: Omit<Curator, 'id' | 'createdAt' | 'updatedAt' | 'contactDetails'>,
  ): Promise<Curator> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating curator: ${id}`);
    const newCurator: Curator = {
      id,
      createdAt: now,
      updatedAt: now,
      ...curator,
    };

    await this.database.put(newCurator);
    return newCurator;
  }

  async getCurator(id: string, include?: string[]): Promise<Curator> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Curator not found');
    }

    return this.populateRelations(entry, include);
  }

  async getCurators(include?: string[]): Promise<Curator[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((curator) => this.populateRelations(curator, include)),
    );
  }

  async getCuratorsByContactDetails(
    contactDetailsId: string,
    include?: string[],
  ): Promise<Curator[]> {
    const all = await this.database.all();
    const curators = all.filter(
      (curator) => curator.contactDetailsId === contactDetailsId,
    );

    return Promise.all(
      curators.map((curator) => this.populateRelations(curator, include)),
    );
  }

  private async populateRelations(
    curator: Curator,
    include?: string[],
  ): Promise<Curator> {
    // Clone the curator to avoid modifying the original
    const populatedCurator = { ...curator };

    // Handle contactDetails population
    if (include?.includes('contactDetails')) {
      try {
        const contactDetails = await this.contactDetailsDatabase.findOne(
          curator.contactDetailsId,
        );
        if (contactDetails) {
          populatedCurator.contactDetails = contactDetails;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch contact details for ${curator.contactDetailsId}`,
          error,
        );
      }
    }

    return populatedCurator;
  }

  async updateCurator(id: string, curator: CuratorCreateDto): Promise<Curator> {
    // First check if curator exists
    await this.getCurator(id);

    const now = new Date().toISOString();

    // Create updated curator with ID preserved
    const updatedCurator: Curator = {
      id,
      createdAt: now,
      updatedAt: now,
      ...curator,
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

    // Create updated curator by merging existing with update
    const updatedCurator = {
      ...existingCurator,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating curator: ${id}`);
    await this.database.put(updatedCurator);
    return updatedCurator;
  }

  async deleteCurator(id: string): Promise<{ message: string }> {
    const curator = await this.getCurator(id);
    await this.database.del(id);
    return {
      message: `Curator "${curator.name}" with contact details ${curator.contactDetailsId} deleted successfully`,
    };
  }
}
