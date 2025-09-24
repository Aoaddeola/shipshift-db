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
  async getAgent(@Param('id') id: string) {
    return this.agentService.getAgent(id);
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

  @Get()
  async getAgents(
    @Query('contactDetailsId') contactDetailsId?: string,
    @Query('operatorId') operatorId?: string,
  ) {
    if (contactDetailsId && operatorId) {
      return this.agentService.getAgentsByContactAndOperator(
        contactDetailsId,
        operatorId,
      );
    } else if (contactDetailsId) {
      return this.agentService.getAgentsByContactDetails(contactDetailsId);
    } else if (operatorId) {
      return this.agentService.getAgentsByOperator(operatorId);
    }
    return this.agentService.getAgents();
  }

  @Get('contact/:contactDetailsId')
  async getAgentsByContactDetails(
    @Param('contactDetailsId') contactDetailsId: string,
  ) {
    return this.agentService.getAgentsByContactDetails(contactDetailsId);
  }

  @Get('operator/:operatorId')
  async getAgentsByOperator(@Param('operatorId') operatorId: string) {
    return this.agentService.getAgentsByOperator(operatorId);
  }

  @Get('journey/:journeyId')
  async getAgentsByJourney(@Param('journeyId') journeyId: string) {
    return this.agentService.getAgentsByJourney(journeyId);
  }

  @Delete(':id')
  async deleteAgent(@Param('id') id: string) {
    return this.agentService.deleteAgent(id);
  }
}
