// src/planning/dto/plan-journey-response.dto.ts

import { Journey } from '../logistics/journey/journey.types.js';

export class PlanJourneyResponseDto {
  success: boolean;
  path: Journey[] | null;
  totalCost: number;
  totalDistance: number;
  totalPrice: number;
  totalDurationHours: number;
  message: string;

  constructor(partial: Partial<PlanJourneyResponseDto>) {
    Object.assign(this, partial);
  }
}
