import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Operator } from './operator.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { OperatorCreateDto } from './operator-create.dto.js';
import { OperatorUpdateDto } from './operator-update.dto.js';
import { ColonyNodeService } from '../../onchain/colony-node/colony-node.service.js';
import { OperatorBadgeService } from '../../onchain/operator-badge/operator-badge.service.js';

@Injectable()
export class OperatorService {
  private readonly logger = new Logger(OperatorService.name);

  constructor(
    @InjectDatabase('operator') private database: Database<Operator>,
    @Inject(ColonyNodeService)
    private colonyNodeService: ColonyNodeService,
    @Inject(OperatorBadgeService)
    private operatorBadgeService: OperatorBadgeService,
  ) {}

  async createOperator(
    operator: Omit<Operator, 'id' | 'createdAt' | 'updatedAt'>,
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
      throw new UnprocessableEntityException('Operator not found');
    }

    return this.populateRelations(entry, include);
  }

  async getOperatorByAddress(
    opAddr: string,
    include?: string[],
  ): Promise<Operator> {
    const all = await this.database.all();
    const operator = all.find((op) => op.onchain.opAddr === opAddr);
    if (!operator) {
      throw new NotFoundException('Operator with this address not found');
    }

    return this.populateRelations(operator, include);
  }

  async getOperatorsByColonyNode(
    colonyNodeId: string,
    include?: string[],
  ): Promise<Operator[]> {
    const all = await this.database.all();
    const operators = all.filter(
      (op) => op.offchain.colonyNodeId === colonyNodeId,
    );

    return Promise.all(
      operators.map((operator) => this.populateRelations(operator, include)),
    );
  }

  async getOperators(include?: string[]): Promise<Operator[]> {
    const all = await this.database.all();

    const filteredOperators = await Promise.all(
      all.map(async (operator) => {
        const opBadge =
          await this.operatorBadgeService.getOperatorBadgesByOpWalletAddress(
            operator.onchain.opAddr,
          );
        return opBadge.length !== 0 ? operator : null;
      }),
    );

    // Filter out null values and populate relations
    return Promise.all(
      filteredOperators
        .filter((operator): operator is Operator => operator !== null)
        .map((operator) => this.populateRelations(operator, include)),
    );
  }

  private async populateRelations(
    operator: Operator,
    include?: string[],
  ): Promise<Operator> {
    // Clone the operator to avoid modifying the original
    const populatedOperator = { ...operator };

    // Handle offchain relations
    if (include?.includes('offchain')) {
      // Handle colonyNode population
      if (include?.includes('colonyNode')) {
        try {
          const colonyNode = await this.colonyNodeService.getColonyNode(
            operator.offchain.colonyNodeId,
          );
          if (colonyNode) {
            // Create a copy of offchain with colonyNode
            populatedOperator.offchain = {
              ...operator.offchain,
              colonyNode: colonyNode,
            };
          }
        } catch (error) {
          this.logger.warn(
            `Could not fetch colony node for ${operator.offchain.colonyNodeId}`,
            error,
          );
        }
      }
      // Handle colonyNode population
      if (include?.includes('badge')) {
        try {
          const badge =
            await this.operatorBadgeService.getOperatorBadgesByOpWalletAddress(
              operator.onchain.opAddr,
            );
          if (badge.length > 0) {
            // Create a copy of offchain with badge
            populatedOperator.offchain = {
              ...operator.offchain,
              badge: badge[0],
            };
          }
        } catch (error) {
          this.logger.warn(
            `Could not fetch colony node for ${operator.offchain.colonyNodeId}`,
            error,
          );
        }
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

    // Handle nested onchain update
    let updatedOnchain = existingOperator.onchain;
    if (update.onchain) {
      updatedOnchain = {
        ...existingOperator.onchain,
        ...update.onchain,
        opMinCollateralPerParticipant: update.onchain
          .opMinCollateralPerParticipant
          ? update.onchain.opMinCollateralPerParticipant
          : existingOperator.onchain.opMinCollateralPerParticipant,
      };
    }

    // Handle nested offchain update
    let updatedOffchain = existingOperator.offchain;
    if (update.offchain) {
      updatedOffchain = {
        ...existingOperator.offchain,
        ...update.offchain,
      };
    }

    // Create updated operator by merging existing with update
    const updatedOperator = {
      ...existingOperator,
      onchain: updatedOnchain,
      offchain: updatedOffchain,
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
      message: `Operator with address ${operator.onchain.opAddr} deleted successfully`,
    };
  }
}
