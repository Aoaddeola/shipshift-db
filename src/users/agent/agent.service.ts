import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDatabase } from '../../orbitdb/inject-database.decorator.js';
import { Agent } from './agent.types.js';
import { Database } from '../../orbitdb/database.js';
import { randomUUID } from 'node:crypto';
import { AgentCreateDto } from './agent-create.dto.js';
import { AgentUpdateDto } from './agent-update.dto.js';
import { ContactDetailsService } from '../../common/contact-details/contact-details.service.js';
import { OperatorService } from '../operator/operator.service.js';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  constructor(
    @InjectDatabase('agent') private database: Database<Agent>,
    @Inject(ContactDetailsService)
    private contactDetailsDatabase: ContactDetailsService,
    @Inject(OperatorService) private operatorDatabase: OperatorService,
  ) {}

  async createAgent(
    agent: Omit<
      Agent,
      'id' | 'createdAt' | 'updatedAt' | 'contactDetails' | 'operator'
    >,
  ): Promise<Agent> {
    const id = randomUUID();
    const now = new Date().toISOString();

    this.logger.log(`Creating agent: ${id}`);
    const newAgent: Agent = {
      id,
      createdAt: now,
      updatedAt: now,
      ...agent,
    };

    await this.database.put(newAgent);
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

  async getAgentsByContactDetails(
    contactDetailsId: string,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) => agent.contactDetailsId === contactDetailsId,
    );

    return Promise.all(
      agents.map((agent) => this.populateRelations(agent, include)),
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

  async getAgentsByContactAndOperator(
    contactDetailsId: string,
    operatorId: string,
    include?: string[],
  ): Promise<Agent[]> {
    const all = await this.database.all();
    const agents = all.filter(
      (agent) =>
        agent.contactDetailsId === contactDetailsId &&
        agent.operatorId === operatorId,
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

    // Handle contactDetails population
    if (include?.includes('contactDetails')) {
      try {
        const contactDetails = await this.contactDetailsDatabase.findOne(
          agent.contactDetailsId,
        );
        if (contactDetails) {
          populatedAgent.contactDetails = contactDetails;
        }
      } catch (error) {
        this.logger.warn(
          `Could not fetch contact details for ${agent.contactDetailsId}`,
          error,
        );
      }
    }

    // Handle operator population
    if (include?.includes('operator')) {
      try {
        const operator = await this.operatorDatabase.getOperator(
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
      message: `Agent "${agent.name}" with operator ID ${agent.operatorId} deleted successfully`,
    };
  }
}
