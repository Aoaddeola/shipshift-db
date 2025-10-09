import { Location } from '../../common/location/location.types.js';
import { Agent } from '../../profiles/agent/agent.types.js';
import { ParcelHandlingInfo } from '../parcel/parcel.types.js';

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
  price: number; // optional agent fee
  status?: JourneyStatus; // added status field for completeness
  parcelHandlingInfo: ParcelHandlingInfo;
  agent?: Agent; // Embedded agent
  fromLocation?: Location; // Embedded from location
  toLocation?: Location; // Embedded to location
  createdAt?: string;
  updatedAt?: string;
}
