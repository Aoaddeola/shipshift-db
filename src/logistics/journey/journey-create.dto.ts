import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  IsDate,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Journey, JourneyStatus } from './journey.types.js';

export class JourneyCreateDto implements Omit<Journey, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'agent-123' })
  agentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'location-456' })
  fromLocationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'location-789' })
  toLocationId: string;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-04-01T09:00:00Z' })
  availableFrom: Date;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-04-05T17:00:00Z' })
  availableTo: Date;

  @IsNumber()
  @Min(0.001)
  @ApiProperty({
    example: 10,
    description: 'Capacity in packages or weight units',
  })
  capacity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({ example: 50, description: 'Optional agent fee' })
  price?: number;

  @IsOptional()
  @IsEnum(JourneyStatus)
  @ApiPropertyOptional({
    enum: JourneyStatus,
    default: JourneyStatus.AVAILABLE,
    description: 'Current status of the journey',
  })
  status?: JourneyStatus;
}
