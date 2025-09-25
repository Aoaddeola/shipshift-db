import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
} from '@nestjs/common';
import { AgentService } from './agent.service.js';
import { AgentCreateDto } from './agent-create.dto.js';
import { AgentUpdateDto } from './agent-update.dto.js';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Post()
  async createAgent(@Body() agent: AgentCreateDto) {
    return this.agentService.createAgent(agent);
  }

  @Get(':id')
  async getAgent(@Param('id') id: string, @Query('include') include?: string) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgent(id, includeArray);
  }

  @Get()
  async getAgents(
    @Query('contactDetailsId') contactDetailsId?: string,
    @Query('operatorId') operatorId?: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (contactDetailsId && operatorId) {
      return this.agentService.getAgentsByContactAndOperator(
        contactDetailsId,
        operatorId,
        includeArray,
      );
    } else if (contactDetailsId) {
      return this.agentService.getAgentsByContactDetails(
        contactDetailsId,
        includeArray,
      );
    } else if (operatorId) {
      return this.agentService.getAgentsByOperator(operatorId, includeArray);
    }
    return this.agentService.getAgents(includeArray);
  }

  @Get('contact/:contactDetailsId')
  async getAgentsByContactDetails(
    @Param('contactDetailsId') contactDetailsId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByContactDetails(
      contactDetailsId,
      includeArray,
    );
  }

  @Get('operator/:operatorId')
  async getAgentsByOperator(
    @Param('operatorId') operatorId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByOperator(operatorId, includeArray);
  }

  @Put(':id')
  async updateAgent(@Param('id') id: string, @Body() agent: AgentCreateDto) {
    return this.agentService.updateAgent(id, agent);
  }

  @Patch(':id')
  async partialUpdateAgent(
    @Param('id') id: string,
    @Body() update: AgentUpdateDto,
  ) {
    return this.agentService.partialUpdateAgent(id, update);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    return this.agentService.deleteAgent(id);
  }
}
