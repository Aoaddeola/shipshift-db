import { Controller, Get, Param } from '@nestjs/common';
import { AgentMetricsService } from './agent/agent-metrics.service.js';
import { AgentMetrics } from './agent/agent-metrics.types.js';
import { StepService } from '../onchain/step/step.service.js';
import { StepTxService } from '../onchain/step_tx/step-tx.service.js';
import { generateDeliveryRecord } from './agent/metricsCalculator.js';
import { AgentService } from '../profiles/agent/agent.service.js';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly agentMetricsService: AgentMetricsService,
    private readonly stepService: StepService,
    private readonly agentService: AgentService,
    private readonly stepTxService: StepTxService,
  ) {}

  @Get('agent/:agentId')
  async getAgentMetrics(
    @Param('agentId') agentId: string,
  ): Promise<AgentMetrics> {
    const steps = await this.stepService.getStepsByAgent(agentId);
    const deliveries = await Promise.all(
      steps.map(
        async (step) => await generateDeliveryRecord(step, this.stepTxService),
      ),
    );
    return this.agentMetricsService.calculateAgentMetrics(agentId, deliveries);
  }

  @Get('agents')
  async getAllAgentsMetrics(): Promise<Map<string, AgentMetrics>> {
    const agents = await this.agentService.getAgents();
    const steps = await Promise.all(
      agents.map(
        async (agent) => await this.stepService.getStepsByAgent(agent.id),
      ),
    );
    const deliveries = await Promise.all(
      steps
        .flat()
        .map(
          async (step) =>
            await generateDeliveryRecord(step, this.stepTxService),
        ),
    );
    return this.agentMetricsService.calculateMultipleAgentsMetrics(deliveries);
  }
}
