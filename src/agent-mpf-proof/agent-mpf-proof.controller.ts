import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { AgentMPFProofService } from './agent-mpf-proof.service.js';

@Controller('agent-mpf-proof')
export class AgentMPFProofController {
  constructor(private readonly agentMPFProofService: AgentMPFProofService) {}

  @Get()
  async getAgentMPFProofs() {
    return this.agentMPFProofService.getAgentMPFProofs();
  }

  @Get(':id')
  async getAgentMPFProof(@Param('id') id: string) {
    return this.agentMPFProofService.getAgentMPFProof(id);
  }

  @Get('operator/:operatorId')
  async getAgentMPFProofsByOperator(@Param('operatorId') operatorId: string) {
    return this.agentMPFProofService.getAgentMPFProofsByOperator(operatorId);
  }

  @Delete(':id')
  async deleteAgentMPFProof(@Param('id') id: string) {
    return this.agentMPFProofService.deleteAgentMPFProof(id);
  }
}
