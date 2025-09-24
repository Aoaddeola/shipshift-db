/**
 * Journey Status Enum
 */
export enum JourneyStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Journey Interface
 */
export interface Journey {
  id: string;
  agentId: string;
  fromLocationId: string;
  toLocationId: string;
  availableFrom: Date; // ISO 8601 date string
  availableTo: Date; // ISO 8601 date string
  capacity: number; // packages or weight
  price?: number; // optional agent fee
  status?: JourneyStatus; // added status field for completeness
}
