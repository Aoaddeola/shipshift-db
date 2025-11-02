import { Controller, Get, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { MetricsService } from './metrics.service.js';
import {
  AgentMetrics,
  JourneyMetrics,
  MetricsFilter,
} from './metrics.types.js';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('agents/:agentId')
  async getAgentMetrics(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Query() filter: MetricsFilter,
  ): Promise<AgentMetrics> {
    return this.metricsService.getAgentMetrics(agentId, filter);
  }

  @Get('agents')
  async getAllAgentsMetrics(
    @Query() filter: MetricsFilter,
  ): Promise<AgentMetrics[]> {
    return this.metricsService.getAllAgentsMetrics(filter);
  }

  @Get('journeys/:journeyId')
  async getJourneyMetrics(
    @Param('journeyId', ParseUUIDPipe) journeyId: string,
  ): Promise<JourneyMetrics> {
    return this.metricsService.getJourneyMetrics(journeyId);
  }

  @Get('agents/:agentId/journeys')
  async getAgentJourneyMetrics(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Query() filter: MetricsFilter,
  ): Promise<JourneyMetrics[]> {
    return this.metricsService.getJourneyMetricsByAgent(agentId, filter);
  }

  @Get('agents/:agentId/performance')
  async getAgentPerformanceOverTime(
    @Param('agentId', ParseUUIDPipe) agentId: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'weekly',
  ): Promise<{ period: string; metrics: AgentMetrics }[]> {
    return this.metricsService.getAgentPerformanceOverTime(agentId, period);
  }
}
