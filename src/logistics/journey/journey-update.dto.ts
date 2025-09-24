import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { JourneyStatus } from './journey.types.js';

export class JourneyUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'agent-456' })
  agentId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'location-111' })
  fromLocationId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'location-222' })
  toLocationId?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional({ example: '2025-04-02T09:00:00Z' })
  availableFrom?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiPropertyOptional({ example: '2025-04-06T17:00:00Z' })
  availableTo?: Date;

  @IsNumber()
  @Min(0.001)
  @IsOptional()
  @ApiPropertyOptional({ example: 15, description: 'Updated capacity' })
  capacity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ example: 75, description: 'Updated agent fee' })
  price?: number;

  @IsEnum(JourneyStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: JourneyStatus,
    description: 'Updated status of the journey',
  })
  status?: JourneyStatus;
}
