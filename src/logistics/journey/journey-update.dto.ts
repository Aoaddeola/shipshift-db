import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { JourneyStatus } from './journey.types.js';
import { ParcelHandlingInfoUpdateDto } from '../parcel/parcel-update.dto.js';

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

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '2025-04-02T09:00:00Z' })
  availableFrom?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '2025-04-06T17:00:00Z' })
  availableTo?: string;

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

  @ValidateNested()
  @Type(() => ParcelHandlingInfoUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: ParcelHandlingInfoUpdateDto })
  parcelHandlingInfo?: ParcelHandlingInfoUpdateDto;
}
