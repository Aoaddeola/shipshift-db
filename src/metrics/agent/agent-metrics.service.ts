import { Injectable, Logger } from '@nestjs/common';
import { AgentMetrics, DeliveryRecord } from './agent-metrics.types.js';
import { calculateAgentMetrics } from './metricsCalculator.js';

@Injectable()
export class AgentMetricsService {
  private readonly logger = new Logger(AgentMetricsService.name);

  calculateAgentMetrics(
    agentId: string,
    deliveryRecords: DeliveryRecord[],
  ): AgentMetrics {
    try {
      return calculateAgentMetrics(deliveryRecords);
    } catch (error) {
      this.logger.error(
        `Error calculating metrics for agent ${agentId}: ${error.message}`,
      );
      return this.createEmptyMetrics(agentId);
    }
  }

  calculateMultipleAgentsMetrics(
    deliveryRecords: DeliveryRecord[],
  ): Map<string, AgentMetrics> {
    const agentMetrics = new Map<string, AgentMetrics>();
    const agentIds = [
      ...new Set(deliveryRecords.map((record) => record.agentId)),
    ];

    agentIds.forEach((agentId) => {
      const metrics = this.calculateAgentMetrics(agentId, deliveryRecords);
      agentMetrics.set(agentId, metrics);
    });

    return agentMetrics;
  }

  aggregateMetrics(metricsArray: AgentMetrics[]): Partial<AgentMetrics> {
    if (metricsArray.length === 0) {
      return {};
    }

    return {
      totalDeliveries: metricsArray.reduce(
        (sum, m) => sum + m.totalDeliveries,
        0,
      ),
      successfulDeliveries: metricsArray.reduce(
        (sum, m) => sum + m.successfulDeliveries,
        0,
      ),
      failedDeliveries: metricsArray.reduce(
        (sum, m) => sum + m.failedDeliveries,
        0,
      ),
      pendingDeliveries: metricsArray.reduce(
        (sum, m) => sum + m.pendingDeliveries,
        0,
      ),
      totalEarnings: metricsArray.reduce((sum, m) => sum + m.totalEarnings, 0),
      totalDistanceKm: metricsArray.reduce(
        (sum, m) => sum + m.totalDistanceKm,
        0,
      ),
      totalDeliveryTimeMinutes: metricsArray.reduce(
        (sum, m) => sum + m.totalDeliveryTimeMinutes,
        0,
      ),
    };
  }

  private createEmptyMetrics(agentId: string): AgentMetrics {
    return {
      agentId,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      pendingDeliveries: 0,
      totalEarnings: 0,
      totalDistanceKm: 0,
      averageDeliveryTimeMinutes: 0,
      totalDeliveryTimeMinutes: 0,
      averageRating: 0,
      activeDays: 0,
    };
  }
}
