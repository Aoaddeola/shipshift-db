// src/journey/journey.types.ts

import { OperatorAvailability } from '../availability/types.js';

/**
 * Journey interface
 */
export interface Journey {
  id: string;
  start: OperatorAvailability;
  end: OperatorAvailability;
  cost: Record<string, number>;
}