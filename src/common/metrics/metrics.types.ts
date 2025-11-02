import { JourneyStatus } from '../../logistics/journey/journey.types.js';

export interface AgentMetrics {
  id: string;
  name: string;
  completedMissions: number;
  successRate: number;
  totalRevenue: number;
  averageRating: number;
  location: string;
}

export interface JourneyMetrics {
  id: string;
  agentId: string;
  from: string;
  to: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  utilizedCapacity: number;
  price: number;
  status: JourneyStatus;
}

export interface MetricsFilter {
  startDate?: Date;
  endDate?: Date;
  agentId?: string;
  status?: JourneyStatus;
}
