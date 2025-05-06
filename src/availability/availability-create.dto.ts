// src/availability/availability-create.dto.ts

import {
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  IsObject,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OperatorType, OperatorAvailability } from './types.js';

// Nested DTOs
class LocationDto {
  @IsString()
  @ApiProperty({ example: '123 Main St' })
  street: string;

  @IsString()
  @ApiProperty({ example: 'New York' })
  city: string;

  @IsString()
  @ApiProperty({ example: 'NY' })
  state: string;

  @IsString()
  @ApiProperty({ example: 'USA' })
  country: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: -74.006 })
  longitude?: number;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 40.7128 })
  latitude?: number;
}

class AvailabilityPeriodDto {
  @IsString()
  @ApiProperty({ example: 'Monday' })
  day: string;

  @IsString()
  @ApiProperty({ example: '09:00' })
  from: string;

  @IsString()
  @ApiProperty({ example: '17:00' })
  to: string;
}

export class AvailabilityDto {
  @IsObject()
  @ApiProperty({ type: LocationDto })
  location: LocationDto;

  @IsEnum(OperatorType)
  @ApiProperty({ enum: OperatorType })
  availableAs: OperatorType;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ type: AvailabilityPeriodDto, isArray: true })
  periods?: AvailabilityPeriodDto[];
}

export class OperatorAvailabilityCreateDto
  implements Omit<OperatorAvailability, 'id'>
{
  @IsString()
  @ApiProperty({ example: 'colony-123' })
  colonyId: string;

  @IsString()
  @ApiProperty({ example: 'addr1q9abcdef1234567890' })
  walletAddress: string;

  @IsObject()
  @ApiProperty({ type: AvailabilityDto })
  availability: AvailabilityDto;
}
