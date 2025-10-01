import {
  IsString,
  IsDate,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { LocationUpdateDto } from '../../common/location/location-update.dto.js';
import { ShipmentStatus } from './shipment.types.js';

export class ShipmentUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'customer-456' })
  senderId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'parcel-789' })
  parcelId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2',
    description: 'Updated quantity as string',
  })
  quantity?: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-02T09:00:00Z',
    description: 'Updated pickup date',
  })
  pickupDate?: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-06T17:00:00Z',
    description: 'Updated ETA date',
  })
  etaDate?: string;

  @ValidateNested()
  @Type(() => LocationUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({
    type: LocationUpdateDto,
    description: 'Updated from location details',
  })
  fromLocation?: LocationUpdateDto;

  @ValidateNested()
  @Type(() => LocationUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({
    type: LocationUpdateDto,
    description: 'Updated to location details',
  })
  toLocation?: LocationUpdateDto;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'mission-345',
    description: 'Updated mission ID',
  })
  missionId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'journey-678',
    description: 'Updated journey ID',
  })
  journeyId?: string;

  @IsEnum(ShipmentStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: ShipmentStatus,
    description: 'Updated status of the shipment',
  })
  status?: ShipmentStatus;
}
