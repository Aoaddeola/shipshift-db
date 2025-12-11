import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AgentMPFProof } from './agent-mpf-proof.types.js';
import { randomUUID } from 'node:crypto';
import { AgentMPFProofCreateDto } from './agent-mpf-proof-create.dto.js';
import { AgentMPFProofUpdateDto } from './agent-mpf-proof-update.dto.js';
import { Database } from '../db/orbitdb/database.js';
import { InjectDatabase } from '../db/orbitdb/inject-database.decorator.js';

@Injectable()
export class AgentMPFProofService {
  private readonly logger = new Logger(AgentMPFProofService.name);

  constructor(
    @InjectDatabase('agent-mpf-proof')
    private database: Database<AgentMPFProof>,
  ) {}

  async createAgentMPFProof(
    proof: Omit<AgentMPFProof, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AgentMPFProof> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating agent MPF proof: ${id}`);
    const newProof: AgentMPFProof = {
      id,
      createdAt: now,
      updatedAt: now,
      ...proof,
    };

    await this.database.put(newProof);
    return newProof;
  }

  async getAgentMPFProof(id: string): Promise<AgentMPFProof> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Agent MPF proof not found');
    }
    return entry;
  }

  async updateAgentMPFProof(
    id: string,
    proof: AgentMPFProofCreateDto,
  ): Promise<AgentMPFProof> {
    // First check if proof exists
    await this.getAgentMPFProof(id);

    const now = new Date().toISOString();

    // Create updated proof with ID preserved
    const updatedProof: AgentMPFProof = {
      id,
      createdAt: now,
      updatedAt: now,
      ...proof,
    };

    this.logger.log(`Updating agent MPF proof: ${id}`);
    await this.database.put(updatedProof);
    return updatedProof;
  }

  async partialUpdateAgentMPFProof(
    id: string,
    update: AgentMPFProofUpdateDto,
  ): Promise<AgentMPFProof> {
    const existingProof = await this.getAgentMPFProof(id);
    const now = new Date().toISOString();

    // Create updated proof by merging existing with update
    const updatedProof = {
      ...existingProof,
      ...update,
      updatedAt: now,
    };

    this.logger.log(`Partially updating agent MPF proof: ${id}`);
    await this.database.put(updatedProof);
    return updatedProof;
  }

  async getAgentMPFProofs(): Promise<AgentMPFProof[]> {
    return this.database.all();
  }

  async getAgentMPFProofsByOperator(
    operatorId: string,
  ): Promise<AgentMPFProof[]> {
    const all = await this.database.all();
    return all.filter((proof) => proof.operatorId === operatorId);
  }

  async deleteAgentMPFProof(id: string): Promise<{ message: string }> {
    const proof = await this.getAgentMPFProof(id);
    await this.database.del(id);
    return {
      message: `Agent MPF proof with root hash ${proof.rootHash} deleted successfully`,
    };
  }
}
