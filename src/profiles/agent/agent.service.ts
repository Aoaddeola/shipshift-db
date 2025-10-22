import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../db/orbitdb/inject-database.decorator.js';
import { Agent, AgentType, ConveyanceMeans } from './agent.types.js';
import { Database } from '../../db/orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { AgentCreateDto } from './agent-create.dto.js';
import { AgentUpdateDto } from './agent-update.dto.js';
import { UserService } from '../../users/user/user.service.js';
import { OperatorService } from '../../users/operator/operator.service.js';
import { UserType } from '../../users/user/user.types.js';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectDatabase('agent') private database: Database<Agent>,
    @Inject(OperatorService)
    private operatorService: OperatorService,
    @Inject(UserService)
    private userService: UserService,
  ) {}

  async createAgent(
    agent: Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'operator'>,
  ): Promise<Agent> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating agent: ${id}`);
    const newAgent: Agent = {
      id,
      ...agent,
      createdAt: now,
      updatedAt: now,
    };

    await this.database.put(newAgent);
    await this.userService.update(agent.ownerId, { userType: UserType.AGENT });
    return newAgent;
  }

  async getAgent(id: string, include?: string[]): Promise<Agent> {
    const entry = await this.database.get(id);
    if (!entry) {
      throw new NotFoundException('Agent not found');
    }

    return this.populateRelations(entry, include);
  }

  async getAgents(include?: string[]): Promise<Agent[]> {
    const all = await this.database.all();
    return Promise.all(
      all.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOperator(
    operatorId: string,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter((agent) => agent.operatorId === operatorId);

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOwner(
    ownerId: string,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter((agent) => agent.ownerId === ownerId);

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByType(type: AgentType, include?: string[]): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter((agent) => agent.type === type);

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByConveyance(
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) => agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOperatorAndOwner(
    operatorId: string,
    ownerId: string,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) => agent.operatorId === operatorId && agent.ownerId === ownerId,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOperatorAndType(
    operatorId: string,
    type: AgentType,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) => agent.operatorId === operatorId && agent.type === type,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOperatorAndConveyance(
    operatorId: string,
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.operatorId === operatorId &&
        agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOwnerAndType(
    ownerId: string,
    type: AgentType,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) => agent.ownerId === ownerId && agent.type === type,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOwnerAndConveyance(
    ownerId: string,
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.ownerId === ownerId && agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByTypeAndConveyance(
    type: AgentType,
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) => agent.type === type && agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOperatorOwnerAndType(
    operatorId: string,
    ownerId: string,
    type: AgentType,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.operatorId === operatorId &&
        agent.ownerId === ownerId &&
        agent.type === type,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOperatorOwnerAndConveyance(
    operatorId: string,
    ownerId: string,
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.operatorId === operatorId &&
        agent.ownerId === ownerId &&
        agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOperatorTypeAndConveyance(
    operatorId: string,
    type: AgentType,
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.operatorId === operatorId &&
        agent.type === type &&
        agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByOwnerTypeAndConveyance(
    ownerId: string,
    type: AgentType,
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.ownerId === ownerId &&
        agent.type === type &&
        agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  async getAgentsByAllFilters(
    operatorId: string,
    ownerId: string,
    type: AgentType,
    conveyance: ConveyanceMeans,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.operatorId === operatorId &&
        agent.ownerId === ownerId &&
        agent.type === type &&
        agent.meansOfConveyance === conveyance,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
    );
  }

  private async populateRelations(
    agent: Agent,
    include?: string[],
  ): Promise<Agent> {
    // Clone the agent to avoid modifying the original
    const populatedAgent = { ...agent };

    // Handle operator population
    if (include?.includes('operator')) {
      try {
        const operator = await this.operatorService.getOperator(
          agent.operatorId,
        );
        if (operator) {
          populatedAgent.operator = operator;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch operator for ${agent.operatorId}`,
          error,
        );
      }
    }

    // Handle owner population
    if (include?.includes('owner')) {
      try {
        const owner = await this.userService.findById(agent.ownerId);
        if (owner) {
          populatedAgent.owner = owner;
        }
      } catch (error) {
        this.logger.warn(`Could not fetch owner for ${agent.ownerId}`, error);
      }
    }

    return populatedAgent;
  }

  async updateAgent(id: string, agent: AgentCreateDto): Promise<Agent> {
    // First check if agent exists
    await this.getAgent(id);

    const now = new Date().toISOString();

    // Create updated agent with ID preserved
    const updatedAgent: Agent = {
      id,
      createdAt: now,
      updatedAt: now,
      ...agent,
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
    };

    this.logger.log(`Partially updating agent: ${id}`);
    await this.database.put(updatedAgent);
    return updatedAgent;
  }

  async deleteAgent(id: string): Promise<{ message: string }> {
    const agent = await this.getAgent(id);
    await this.database.del(id);
    return {
      message: `Agent "${agent.name}" with operator ID ${agent.operatorId} and owner ID ${agent.ownerId} deleted successfully`,
    };
  }
}
