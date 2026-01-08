import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsDateString,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Shipment, ShipmentStatus } from './shipment.types.js';

export class ShipmentCreateDto
  implements
    Omit<
      Shipment,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'fromLocation'
      | 'toLocation'
      | 'mission'
      | 'parcel'
      | 'journey'
      | 'sender'
    >
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'customer-123',
    description: 'ID of the sender (customer)',
  })
  senderId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'parcel-456',
    description: 'ID of the parcel being shipped',
  })
  parcelId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'senderWalletAddress-456',
    description: 'Wallet address of sender',
  })
  senderWalletAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '1',
    description: 'Quantity of items being shipped (as string)',
  })
  quantity: string;

  @IsDateString()
  @ApiProperty({
    example: '2025-04-01T09:00:00Z',
    description: 'Planned pickup date and time (ISO 8601)',
  })
  pickupDate: string;

  @IsDateString()
  @ApiProperty({
    example: '2025-04-05T17:00:00Z',
    description: 'Estimated time of arrival (ISO 8601)',
  })
  etaDate: string;

  @IsBoolean()
  @ApiProperty({
    example: 'true',
    description:
      'Flag to determine is shipment can be displayed in marketplace',
  })
  marketplaceEligible: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'location-789',
    description: 'ID of the pickup location',
  })
  fromLocationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'location-012',
    description: 'ID of the delivery location',
  })
  toLocationId: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'mission-345',
    description: 'ID of the mission (optional)',
  })
  missionId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'journey-678',
    description: 'ID of the journey (optional)',
  })
  journeyId?: string;

  @IsEnum(ShipmentStatus)
  @ApiProperty({
    enum: ShipmentStatus,
    default: ShipmentStatus.PENDING,
    description: 'Current status of the shipment',
  })
  status: ShipmentStatus = ShipmentStatus.PENDING;
}
