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
import { AgentType, ConveyanceMeans } from './agent.types.js';

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
    @Query('operatorId') operatorId?: string,
    @Query('type') type?: AgentType,
    @Query('conveyance') conveyance?: ConveyanceMeans,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];

    if (operatorId && type && conveyance) {
      return this.agentService.getAgentsByOperatorTypeAndConveyance(
        operatorId,
        type,
        conveyance,
        includeArray,
      );
    } else if (operatorId && type) {
      return this.agentService.getAgentsByOperatorAndType(
        operatorId,
        type,
        includeArray,
      );
    } else if (operatorId && conveyance) {
      return this.agentService.getAgentsByOperatorAndConveyance(
        operatorId,
        conveyance,
        includeArray,
      );
    } else if (type && conveyance) {
      return this.agentService.getAgentsByTypeAndConveyance(
        type,
        conveyance,
        includeArray,
      );
    } else if (operatorId) {
      return this.agentService.getAgentsByOperator(operatorId, includeArray);
    } else if (type) {
      return this.agentService.getAgentsByType(type, includeArray);
    } else if (conveyance) {
      return this.agentService.getAgentsByConveyance(conveyance, includeArray);
    }
    return this.agentService.getAgents(includeArray);
  }

  @Get('operator/:operatorId')
  async getAgentsByOperator(
    @Param('operatorId') operatorId: string,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByOperator(operatorId, includeArray);
  }

  @Get('type/:type')
  async getAgentsByType(
    @Param('type') type: AgentType,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByType(type, includeArray);
  }

  @Get('conveyance/:conveyance')
  async getAgentsByConveyance(
    @Param('conveyance') conveyance: ConveyanceMeans,
    @Query('include') include?: string,
  ) {
    const includeArray = include ? include.split(',') : [];
    return this.agentService.getAgentsByConveyance(conveyance, includeArray);
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
