import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Agent } from './agent.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { AgentCreateDto } from './agent-create.dto.js';
import { AgentUpdateDto } from './agent-update.dto.js';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(@InjectDatabase('agent') private database: Database<Agent>) {}

  async createAgent(
    agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Agent> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating agent: ${id}`);
    const newAgent: Agent = {
      ...agent,
      id,
      createdAt: now,
      updatedAt: now,
      journeyIds: agent.journeyIds || [],
    };

    await this.database.put(newAgent);
    return newAgent;
  }

  async getAgent(id: string): Promise<Agent> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Agent not found');
    }
    return entry;
  }

  async updateAgent(id: string, agent: AgentCreateDto): Promise<Agent> {
    // First check if agent exists
    await this.getAgent(id);

    const now = new Date().toISOString();

    // Create updated agent with ID preserved
    const updatedAgent: Agent = {
      ...agent,
      id,
      createdAt: now,
      updatedAt: now,
      journeyIds: agent.journeyIds || [],
    };

    this.logger.log(`Updating agent: ${id}`);
    await this.database.put(updatedAgent);
    return updatedAgent;
  }

  async partialUpdateAgent(id: string, update: AgentUpdateDto): Promise<Agent> {
    const existingAgent = await this.getAgent(id);
    const now = new Date().toISOString();

    // Create updated agent by merging existing with update
    const updatedAgent = {
      ...existingAgent,
      ...update,
      updatedAt: now,
      // Handle special cases if needed
      journeyIds:
        update.journeyIds !== undefined
          ? update.journeyIds
          : existingAgent.journeyIds,
    };

    this.logger.log(`Partially updating agent: ${id}`);
    await this.database.put(updatedAgent);
    return updatedAgent;
  }

  async getAgents(): Promise<Agent[]> {
    return this.database.all();
  }

  async getAgentsByContactDetails(contactDetailsId: string): Promise<Agent[]> {
    const all = await this.database.all();
    return all.filter((agent) => agent.contactDetailsId === contactDetailsId);
  }

  async getAgentsByOperator(operatorId: string): Promise<Agent[]> {
    const all = await this.database.all();
    return all.filter((agent) => agent.operatorId === operatorId);
  }

  async getAgentsByContactAndOperator(
    contactDetailsId: string,
    operatorId: string,
  ): Promise<Agent[]> {
    const all = await this.database.all();
    return all.filter(
      (agent) =>
        agent.contactDetailsId === contactDetailsId &&
        agent.operatorId === operatorId,
    );
  }

  async getAgentsByJourney(journeyId: string): Promise<Agent[]> {
    const all = await this.database.all();
    return all.filter((agent) => agent.journeyIds.includes(journeyId));
  }

  async deleteAgent(id: string): Promise<{ message: string }> {
    const agent = await this.getAgent(id);
    await this.database.del(id);
    return {
      message: `Agent "${agent.name}" with operator ID ${agent.operatorId} deleted successfully`,
    };
  }
}
