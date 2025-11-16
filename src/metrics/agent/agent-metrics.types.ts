// agentMetrics.ts

export interface AgentMetrics {
  agentId: string; // Unique identifier for the agent
  totalDeliveries: number; // Total number of deliveries completed
  successfulDeliveries: number; // Deliveries completed successfully
  failedDeliveries: number; // Failed or disputed deliveries
  pendingDeliveries: number; // Failed or disputed deliveries
  totalEarnings: number; // Total earnings in ADA
  totalDistanceKm: number; // Total distance covered across deliveries
  averageDeliveryTimeMinutes: number; // Average time per delivery
  totalDeliveryTimeMinutes: number; // Total time spent on deliveries
  averageRating: number; // Mean rating given by users (0–5)
  activeDays: number; // Number of distinct days active
}

export interface DeliveryRecord {
  deliveryId: string;
  agentId: string;
  distanceKm: number;
  durationMinutes: number;
  earningAda: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  rating?: number; // optional user rating for the delivery
  date: string; // ISO date string for active day tracking
}
