import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Database } from '../../orbitdb/database.js';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { OperatorCreateDto } from './operator-create.dto.js';
import { OperatorUpdateDto } from './operator-update.dto.js';
import { Operator } from './operator.types.js';
import { ContactDetailsService } from '../../common/contact-details/contact-details.service.js';

@Injectable()
export class OperatorService {
  private readonly logger = new Logger(OperatorService.name);

  constructor(
    @InjectDatabase('operator') private database: Database<Operator>,
    @Inject(ContactDetailsService)
    private contactDetailsModel: ContactDetailsService,
  ) {}

  async createOperator(
    operator: Omit<
      Operator,
      'id' | 'createdAt' | 'updatedAt' | 'contactDetails'
    >,
  ): Promise<Operator> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating operator: ${id}`);
    const newOperator: Operator = {
      id,
      createdAt: now,
      updatedAt: now,
      ...operator,
    };

    await this.database.put(newOperator);
    return newOperator;
  }

  async getOperator(id: string, include?: string[]): Promise<Operator> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Operator not found');
    }

    return this.populateRelations(entry, include);
  }

  async getOperatorByAddress(
    walletAddress: string,
    include?: string[],
  ): Promise<Operator> {
    const all = await this.database.all();
    const operator = all.find((op) => op.walletAddress === walletAddress);
    if (!operator) {
      throw new NotFoundException(
        'Operator with this wallet address not found',
      );
    }

    return this.populateRelations(operator, include);
  }

  async getOperatorsByContact(
    contactDetailsId: string,
    include?: string[],
  ): Promise<Operator[]> {
    const all = await this.database.all();
    const operators = all.filter(
      (op) => op.contactDetailsId === contactDetailsId,
    );

    return Promise.all(
      operators.map((operator) => this.populateRelations(operator, include)),
    );
  }

  async getOperators(include?: string[]): Promise<Operator[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((operator) => this.populateRelations(operator, include)),
    );
  }

  private async populateRelations(
    operator: Operator,
    include?: string[],
  ): Promise<Operator> {
    // Clone the operator to avoid modifying the original
    const populatedOperator = { ...operator };

    // Handle contactDetails population
    if (include?.includes('contactDetails')) {
      try {
        const contactDetails = await this.contactDetailsModel.findOne(
          operator.contactDetailsId,
        );
        if (contactDetails) {
          populatedOperator.contactDetails = contactDetails;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch contact details for ${operator.contactDetailsId}`,
          error,
        );
      }
    }

    return populatedOperator;
  }

  async updateOperator(
    id: string,
    operator: OperatorCreateDto,
  ): Promise<Operator> {
    // First check if operator exists
    await this.getOperator(id);

    const now = new Date().toISOString();

    // Create updated operator with ID preserved
    const updatedOperator: Operator = {
      id,
      createdAt: now,
      updatedAt: now,
      ...operator,
    };

    this.logger.log(`Updating operator: ${id}`);
    await this.database.put(updatedOperator);
    return updatedOperator;
  }

  async partialUpdateOperator(
    id: string,
    update: OperatorUpdateDto,
  ): Promise<Operator> {
    const existingOperator = await this.getOperator(id);
    const now = new Date().toISOString();

    // Create updated operator by merging existing with update
    const updatedOperator = {
      ...existingOperator,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating operator: ${id}`);
    await this.database.put(updatedOperator);
    return updatedOperator;
  }

  async deleteOperator(id: string): Promise<{ message: string }> {
    const operator = await this.getOperator(id);
    await this.database.del(id);
    return {
      message: `Operator with wallet address ${operator.walletAddress} deleted successfully`,
    };
  }
}
