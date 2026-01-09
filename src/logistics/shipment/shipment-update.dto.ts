import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from './shipment.types.js';

export class ShipmentUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'customer-456',
    description: 'Updated sender ID (customer)',
  })
  senderId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'parcel-789',
    description: 'Updated parcel ID',
  })
  parcelId?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'senderWalletAddress-456',
    description: 'Wallet address of sender',
  })
  senderWalletAddress?: string;

  @IsBoolean()
  @ApiProperty({
    example: 'true',
    description:
      'Flag to determine is shipment can be displayed in marketplace',
  })
  marketplaceEligible?: boolean;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2',
    description: 'Updated quantity (as string)',
  })
  quantity?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-02T09:00:00Z',
    description: 'Updated pickup date and time (ISO 8601)',
  })
  pickupDate?: string;

  @IsDateString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '2025-04-06T17:00:00Z',
    description: 'Updated estimated time of arrival (ISO 8601)',
  })
  etaDate?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'location-111',
    description: 'Updated pickup location ID',
  })
  fromLocationId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'location-222',
    description: 'Updated delivery location ID',
  })
  toLocationId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'mission-333',
    description: 'Updated mission ID',
  })
  missionId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'journey-444',
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
