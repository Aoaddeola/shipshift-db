import { Controller, Get } from '@nestjs/common';
import { OperatorService } from '../users/operator/operator.service.js';
import { StatsService } from './stats.service.js';
import { StatsResponse } from './stats.types.js';
import { AgentService } from '../profiles/agent/agent.service.js';
import { StepService } from '../onchain/step/step.service.js';

@Controller('stats')
export class StatsController {
  constructor(
    private statsService: StatsService,
    private operatorService: OperatorService,
    private agentService: AgentService,
    private stepService: StepService,
  ) {}

  @Get('operator')
  async getOperatorStats(): Promise<StatsResponse> {
    const operators = await this.operatorService.getOperators();

    return this.statsService.getAllStats(operators, {
      entityName: 'Operators',
      totalTitle: 'Total Operators',
      totalDescription: 'Active delivery operators',
      newThisMonthTitle: 'New Operators This Month',
      newThisMonthDescription: 'Operators joined this month',
    });
  }

  @Get('shipment')
  async getShipmentStats(): Promise<StatsResponse> {
    const shipments = [
      ...new Set(
        (await this.stepService.getActiveSteps()).map(
          (step) => step.shipmentId,
        ),
      ),
    ];

    return this.statsService.getAllStats(shipments, {
      entityName: 'Shipments',
      totalTitle: 'Total Shipments',
      totalDescription: 'Active shipments',
      newThisMonthTitle: 'New Shipments This Month',
      newThisMonthDescription: 'Shipments joined this month',
    });
  }

  @Get('agent')
  async getAgentStats(): Promise<StatsResponse> {
    const agents = await this.agentService.getAgents();

    return this.statsService.getAllStats(agents, {
      entityName: 'Agents',
      totalTitle: 'Total Agents',
      totalDescription: 'Active delivery agents',
      newThisMonthTitle: 'New Agents This Month',
      newThisMonthDescription: 'Agents joined this month',
    });
  }

  @Get('journey')
  async getJourneyStats(): Promise<StatsResponse> {
    const journeys = [
      ...new Set(
        (await this.stepService.getSteps()).map((step) => step.journeyId),
      ),
    ];

    return this.statsService.getAllStats(journeys, {
      entityName: 'Journeys',
      totalTitle: 'Journey Utilization',
      totalDescription: 'Journeys in use',
      newThisMonthTitle: 'Journeys Utilization This Month',
      newThisMonthDescription: 'Journeys in use this month',
    });
  }

  @Get('all')
  async getStats(): Promise<StatsResponse[]> {
    return Promise.all([
      this.getOperatorStats(),
      this.getAgentStats(),
      this.getShipmentStats(),
      this.getJourneyStats(),
    ]);
  }
}
