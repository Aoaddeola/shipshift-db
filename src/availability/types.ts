// src/availability/availability.types.ts

/**
 * Location interface with optional coordinates
 */
export type Location = {
  street: string;
  city: string;
  state: string;
  country: string;
  longitude?: number;
  latitude?: number;
};

/**
 * OperatorType enum
 */
export enum OperatorType {
  ReserveOperatorType = 'ReserveOperatorType',
  DispatchOperatorType = 'DispatchOperatorType',
}

/**
 * AvailabilityPeriod interface
 */
export interface AvailabilityPeriod {
  day: string; // e.g., "Monday"
  from: string; // e.g., "09:00"
  to: string; // e.g., "17:00"
}

/**
 * Availability interface
 */
export interface Availability {
  location: Location;
  availableAs: OperatorType;
  periods?: AvailabilityPeriod[];
}

/**
 * OperatorAvailability interface
 */
export interface OperatorAvailability {
  id: string;
  colonyId: string;
  walletAddress: string;
  availability: Availability;
}
