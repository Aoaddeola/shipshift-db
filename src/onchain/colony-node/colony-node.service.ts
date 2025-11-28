import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { ColonyNode } from './colony-node.types.js';
import { Database } from '../../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { ColonyNodeCreateDto } from './colony-node-create.dto.js';
import { ColonyNodeUpdateDto } from './colony-node-update.dto.js';

@Injectable()
export class ColonyNodeService {
  private readonly logger = new Logger(ColonyNodeService.name);

  constructor(
    @InjectDatabase('colony-node') private database: Database<ColonyNode>,
  ) {}

  async createColonyNode(
    colonyNode: Omit<ColonyNode, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ColonyNode> {
    const existingColonyNode = (
      await Promise.all(
        colonyNode.nodeOperatorAddresses.map(
          async (address) =>
            await this.getColonyNodesByOperatorAddress(address),
        ),
      )
    ).flat();

    if (existingColonyNode.length > 0) {
      throw new ConflictException(
        'Colony Node with the same operator(s) already exists',
      );
    }
    const id = randomUUID();
    const now = new Date().toISOString();
    const peerId = (await this.database.getPeerId()).toString();

    this.logger.log(`Creating colony node: ${id}`);
    const newColonyNode: ColonyNode = {
      id,
      createdAt: now,
      updatedAt: now,
      ...colonyNode,
      peerId,
    };

    await this.database.put(newColonyNode);
    return newColonyNode;
  }

  async getColonyNode(id: string): Promise<ColonyNode> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Colony node not found');
    }
    return entry;
  }

  async updateColonyNode(
    id: string,
    colonyNode: ColonyNodeCreateDto,
  ): Promise<ColonyNode> {
    // First check if colony node exists
    await this.getColonyNode(id);

    const now = new Date().toISOString();

    // Create updated colony node with ID preserved
    const updatedColonyNode: ColonyNode = {
      id,
      createdAt: now,
      updatedAt: now,
      ...colonyNode,
    };

    this.logger.log(`Updating colony node: ${id}`);
    await this.database.put(updatedColonyNode);
    return updatedColonyNode;
  }

  // Add this validation in the partialUpdateColonyNode method:
  async partialUpdateColonyNode(
    id: string,
    update: ColonyNodeUpdateDto,
  ): Promise<ColonyNode> {
    const existingColonyNode = await this.getColonyNode(id);
    const now = new Date().toISOString();

    // Create updated colony node by merging existing with update
    const updatedColonyNode = {
      ...existingColonyNode,
      ...update,
      updatedAt: now,
    };

    // Additional validation for numeric fields
    if (updatedColonyNode.minimumActiveSignatory < 1) {
      throw new BadRequestException(
        'minimumActiveSignatory must be at least 1',
      );
    }

    if (
      updatedColonyNode.commissionPercent < 0 ||
      updatedColonyNode.commissionPercent > 100
    ) {
      throw new BadRequestException(
        'commissionPercent must be between 0 and 100',
      );
    }

    if (updatedColonyNode.maximumActiveStepsCount < 1) {
      throw new BadRequestException(
        'maximumActiveStepsCount must be at least 1',
      );
    }

    // Validate operatorTypes if provided
    if (update.operatorTypes && update.operatorTypes.length === 0) {
      throw new BadRequestException('operatorTypes cannot be empty');
    }

    this.logger.log(`Partially updating colony node: ${id}`);
    await this.database.put(updatedColonyNode);
    return updatedColonyNode;
  }

  async getColonyNodes(): Promise<ColonyNode[]> {
    return this.database.all();
  }

  async getColonyNodesByPeerId(peerId: string): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter((node) => node.peerId === peerId);
  }

  async getColonyNodesByMinSignatories(
    minSignatories: number,
  ): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter((node) => node.minimumActiveSignatory >= minSignatories);
  }

  async getColonyNodesByMaxSteps(maxSteps: number): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter((node) => node.maximumActiveStepsCount >= maxSteps);
  }

  async getColonyNodesByPeerIdAndMinSignatories(
    peerId: string,
    minSignatories: number,
  ): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter(
      (node) =>
        node.peerId === peerId && node.minimumActiveSignatory >= minSignatories,
    );
  }

  async getColonyNodesByPeerIdAndMaxSteps(
    peerId: string,
    maxSteps: number,
  ): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter(
      (node) =>
        node.peerId === peerId && node.maximumActiveStepsCount >= maxSteps,
    );
  }

  async getColonyNodesByMinSignatoriesAndMaxSteps(
    minSignatories: number,
    maxSteps: number,
  ): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter(
      (node) =>
        node.minimumActiveSignatory >= minSignatories &&
        node.maximumActiveStepsCount >= maxSteps,
    );
  }

  async getColonyNodesByAllFilters(
    peerId: string,
    minSignatories: number,
    maxSteps: number,
  ): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter(
      (node) =>
        node.peerId === peerId &&
        node.minimumActiveSignatory >= minSignatories &&
        node.maximumActiveStepsCount >= maxSteps,
    );
  }

  async getColonyNodesByOperatorAddress(
    operatorAddress: string,
  ): Promise<ColonyNode[]> {
    const all = await this.database.all();
    return all.filter((node) =>
      node.nodeOperatorAddresses.includes(operatorAddress),
    );
  }

  async deleteColonyNode(id: string): Promise<{ message: string }> {
    const colonyNode = await this.getColonyNode(id);
    await this.database.del(id);
    return {
      message: `Colony node "${colonyNode.name}" with peer ID ${colonyNode.peerId} deleted successfully`,
    };
  }

  async getNodePeerId() {
    return this.database.getPeerId();
  }
}
