// src/planning/dto/plan-journey-request.dto.ts
import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class PlanJourneyRequestDto {
  @IsString()
  startLocationId: string;

  @IsString()
  endLocationId: string;

  @IsNumber()
  @Min(0)
  demand: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  alpha?: number = 1.0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  beta?: number = 0.1;

  @IsOptional()
  @IsNumber()
  @Min(0)
  gamma?: number = 0.05;
}
