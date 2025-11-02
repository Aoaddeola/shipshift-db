import { Injectable, Logger } from '@nestjs/common';
import { JourneyService } from '../../logistics/journey/journey.service.js';
import { AgentService } from '../../profiles/agent/agent.service.js';
import { JourneyStatus } from '../../logistics/journey/journey.types.js';
import { StepService } from '../../onchain/step/step.service.js';
import { Step, StepState } from '../../onchain/step/step.types.js';
import {
  MetricsFilter,
  AgentMetrics,
  JourneyMetrics,
} from './metrics.types.js';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private readonly stepService: StepService,
    private readonly journeyService: JourneyService,
    private readonly agentService: AgentService,
  ) {}

  /**
   * Calculate metrics for a specific agent
   */
  async getAgentMetrics(
    agentId: string,
    filter?: MetricsFilter,
  ): Promise<AgentMetrics> {
    try {
      this.logger.log(`Calculating metrics for agent: ${agentId}`);

      // Get agent details
      const agent = await this.agentService.getAgentsByOwner(agentId);

      // Get all steps for this agent
      const steps = await this.stepService.getStepsByAgent(agentId, [
        'journey',
        'shipment',
      ]);

      // Filter steps by date range if provided
      const filteredSteps = this.filterStepsByDate(steps, filter);

      // Calculate metrics
      const completedMissions = this.calculateCompletedMissions(filteredSteps);
      const successRate = this.calculateSuccessRate(filteredSteps);
      const totalRevenue = this.calculateTotalRevenue(filteredSteps);
      const averageRating = this.calculateAverageRating(filteredSteps);
      const location = await this.getAgentLocation(agentId);

      return {
        id: agentId,
        name: agent[0].name,
        completedMissions,
        successRate,
        totalRevenue,
        averageRating,
        location,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating metrics for agent ${agentId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Calculate metrics for all agents
   */
  async getAllAgentsMetrics(filter?: MetricsFilter): Promise<AgentMetrics[]> {
    try {
      this.logger.log('Calculating metrics for all agents');

      // In a real implementation, you might want to get all agents from AgentService
      // For now, we'll get all steps and group by agent
      const allSteps = await this.stepService.getSteps([
        'agent',
        'journey',
        'shipment',
      ]);
      const filteredSteps = this.filterStepsByDate(allSteps, filter);

      // Group steps by agent
      const stepsByAgent = this.groupStepsByAgent(filteredSteps);

      const agentsMetrics: AgentMetrics[] = [];

      for (const [agentId, steps] of Object.entries(stepsByAgent)) {
        try {
          const agent = await this.agentService.getAgentsByOwner(agentId);
          const completedMissions = this.calculateCompletedMissions(steps);
          const successRate = this.calculateSuccessRate(steps);
          const totalRevenue = this.calculateTotalRevenue(steps);
          const averageRating = this.calculateAverageRating(steps);
          const location = await this.getAgentLocation(agentId);

          agentsMetrics.push({
            id: agentId,
            name: agent[0].name,
            completedMissions,
            successRate,
            totalRevenue,
            averageRating,
            location,
          });
        } catch (error) {
          this.logger.warn(`Skipping metrics for agent ${agentId}:`, error);
        }
      }

      return agentsMetrics;
    } catch (error) {
      this.logger.error('Error calculating metrics for all agents:', error);
      throw error;
    }
  }

  /**
   * Calculate metrics for a specific journey
   */
  async getJourneyMetrics(journeyId: string): Promise<JourneyMetrics> {
    try {
      this.logger.log(`Calculating metrics for journey: ${journeyId}`);

      const journey = await this.journeyService.getJourney(journeyId);
      const steps = await this.stepService.getStepsByJourney(journeyId, [
        'shipment',
      ]);

      const utilizedCapacity = this.calculateUtilizedCapacity(steps);

      return {
        id: journeyId,
        agentId: journey.agentId,
        from: journey.fromLocationId,
        to: journey.toLocationId,
        startTime: new Date(journey.availableFrom),
        endTime: new Date(journey.availableTo),
        capacity: journey.capacity,
        utilizedCapacity,
        price: journey.price,
        status: journey.status || JourneyStatus.AVAILABLE,
      };
    } catch (error) {
      this.logger.error(
        `Error calculating metrics for journey ${journeyId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Calculate metrics for multiple journeys
   */
  async getMultipleJourneysMetrics(
    journeyIds: string[],
  ): Promise<JourneyMetrics[]> {
    try {
      this.logger.log(`Calculating metrics for ${journeyIds.length} journeys`);

      const metricsPromises = journeyIds.map((journeyId) =>
        this.getJourneyMetrics(journeyId).catch((error) => {
          this.logger.warn(`Skipping metrics for journey ${journeyId}:`, error);
          return null;
        }),
      );

      const results = await Promise.all(metricsPromises);
      return results.filter((metric) => metric !== null);
    } catch (error) {
      this.logger.error(
        'Error calculating metrics for multiple journeys:',
        error,
      );
      throw error;
    }
  }

  /**
   * Get journey metrics by agent
   */
  async getJourneyMetricsByAgent(
    agentId: string,
    filter?: MetricsFilter,
  ): Promise<JourneyMetrics[]> {
    try {
      this.logger.log(`Calculating journey metrics for agent: ${agentId}`);

      const steps = await this.stepService.getStepsByAgent(agentId, [
        'journey',
        'shipment',
      ]);
      const filteredSteps = this.filterStepsByDate(steps, filter);

      // Get unique journey IDs from steps
      const journeyIds = [
        ...new Set(filteredSteps.map((step) => step.journeyId)),
      ];

      return this.getMultipleJourneysMetrics(journeyIds);
    } catch (error) {
      this.logger.error(
        `Error calculating journey metrics for agent ${agentId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Calculate agent performance over time
   */
  async getAgentPerformanceOverTime(
    agentId: string,
    period: 'daily' | 'weekly' | 'monthly',
  ): Promise<{ period: string; metrics: AgentMetrics }[]> {
    try {
      const steps = await this.stepService.getStepsByAgent(agentId, [
        'journey',
        'shipment',
      ]);
      const agent = await this.agentService.getAgentsByOwner(agentId);

      // Group steps by time period
      const stepsByPeriod = this.groupStepsByTimePeriod(steps, period);

      const performanceData: { period: string; metrics: AgentMetrics }[] = [];

      for (const [periodLabel, periodSteps] of Object.entries(stepsByPeriod)) {
        const completedMissions = this.calculateCompletedMissions(periodSteps);
        const successRate = this.calculateSuccessRate(periodSteps);
        const totalRevenue = this.calculateTotalRevenue(periodSteps);
        const averageRating = this.calculateAverageRating(periodSteps);
        const location = await this.getAgentLocation(agentId);

        performanceData.push({
          period: periodLabel,
          metrics: {
            id: agentId,
            name: agent[0].name,
            completedMissions,
            successRate,
            totalRevenue,
            averageRating,
            location,
          },
        });
      }

      return performanceData;
    } catch (error) {
      this.logger.error(
        `Error calculating performance over time for agent ${agentId}:`,
        error,
      );
      throw error;
    }
  }

  // Private helper methods

  private filterStepsByDate(steps: Step[], filter?: MetricsFilter): Step[] {
    if (!filter?.startDate && !filter?.endDate) {
      return steps;
    }

    return steps.filter((step) => {
      const stepDate = new Date(step.createdAt!);
      let include = true;

      if (filter.startDate) {
        include = include && stepDate >= filter.startDate;
      }

      if (filter.endDate) {
        include = include && stepDate <= filter.endDate;
      }

      return include;
    });
  }

  private groupStepsByAgent(steps: Step[]): { [agentId: string]: Step[] } {
    return steps.reduce(
      (grouped, step) => {
        const agentId = step.agentId;
        if (!grouped[agentId]) {
          grouped[agentId] = [];
        }
        grouped[agentId].push(step);
        return grouped;
      },
      {} as { [agentId: string]: any[] },
    );
  }

  private groupStepsByTimePeriod(
    steps: Step[],
    period: 'daily' | 'weekly' | 'monthly',
  ): { [period: string]: Step[] } {
    return steps.reduce(
      (grouped, step) => {
        const stepDate = new Date(step.createdAt!);
        let periodKey: string;

        switch (period) {
          case 'daily':
            periodKey = stepDate.toISOString().split('T')[0]; // YYYY-MM-DD
            break;
          case 'weekly': {
            const weekStart = new Date(stepDate);
            weekStart.setDate(stepDate.getDate() - stepDate.getDay());
            periodKey = weekStart.toISOString().split('T')[0];
            break;
          }
          case 'monthly':
            periodKey = `${stepDate.getFullYear()}-${(stepDate.getMonth() + 1).toString().padStart(2, '0')}`;
            break;
          default:
            periodKey = stepDate.toISOString().split('T')[0];
        }

        if (!grouped[periodKey]) {
          grouped[periodKey] = [];
        }
        grouped[periodKey].push(step);
        return grouped;
      },
      {} as { [period: string]: Step[] },
    );
  }

  private calculateCompletedMissions(steps: Step[]): number {
    // Consider a mission completed if the step state indicates completion
    // You might need to adjust this logic based on your actual step states
    const completedStates = [
      StepState.FULFILLED,
      StepState.CLAIMED,
      StepState.COMPLETED,
    ];
    return steps.filter((step) => completedStates.includes(step.state)).length;
  }

  private calculateSuccessRate(steps: Step[]): number {
    if (steps.length === 0) return 0;

    const completedMissions = this.calculateCompletedMissions(steps);
    const totalMissions = steps.length;

    return (completedMissions / totalMissions) * 100;
  }

  private calculateTotalRevenue(steps: Step[]): number {
    return steps.reduce((total, step) => {
      // Assuming journey price is distributed across steps or step has its own revenue
      // Adjust this logic based on your revenue calculation requirements
      if (
        step.journey?.price &&
        (step.state === StepState.CLAIMED ||
          step.state === StepState.COMPLETED ||
          step.state === StepState.FULFILLED)
      ) {
        return total + step.journey.price / 10; // Example distribution
      }
      return total;
    }, 0);
  }

  private calculateAverageRating(steps: Step[]): number {
    const ratedSteps = steps.filter((step) => step.rating != null);
    if (ratedSteps.length === 0) return 0;

    const totalRating = ratedSteps.reduce((sum, step) => sum + step.rating!, 0);
    return totalRating / ratedSteps.length;
  }

  private calculateUtilizedCapacity(steps: Step[]): number {
    return steps.reduce((total, step) => {
      // Assuming each step utilizes some capacity from the journey
      // Adjust this logic based on your capacity calculation
      return total + (step.journey?.parcelHandlingInfo.weight || 0);
    }, 0);
  }

  private async getAgentLocation(agentId: string): Promise<string> {
    try {
      // This is a placeholder implementation
      // In a real scenario, you might get this from the agent's profile or last known location
      const steps = await this.stepService.getStepsByAgent(agentId, [
        'journey',
      ]);
      if (steps.length > 0) {
        const lastStep = steps[steps.length - 1];
        return lastStep.journey?.fromLocationId || 'Unknown';
      }
      return 'Unknown';
    } catch {
      this.logger.warn(`Could not determine location for agent ${agentId}`);
      return 'Unknown';
    }
  }
}
