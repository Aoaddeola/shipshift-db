import { LocationCreateDto } from '../../common/location/location-create.dto.js';
import { Agent } from '../../users/agent/agent.types.js';

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
  availableFrom: string; // ISO 8601 date string
  availableTo: string; // ISO 8601 date string
  capacity: number; // packages or weight
  price?: number; // optional agent fee
  status?: JourneyStatus; // added status field for completeness
  agent?: Agent; // Embedded agent
  fromLocation?: LocationCreateDto; // Embedded from location
  toLocation?: LocationCreateDto; // Embedded to location
  createdAt?: string;
  updatedAt?: string;
}
