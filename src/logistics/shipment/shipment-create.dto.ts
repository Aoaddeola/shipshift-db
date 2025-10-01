import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ShipmentStatus } from './shipment.types.js';
import { LocationCreateDto } from '../../common/location/location-create.dto.js';

export class ShipmentCreateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'customer-123' })
  senderId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'parcel-456' })
  parcelId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1', description: 'Quantity as string' })
  quantity: string;

  @IsDate()
  @ApiProperty({
    example: '2025-04-01T09:00:00Z',
    description: 'ISO 8601 date string',
  })
  pickupDate: string;

  @IsDate()
  @ApiProperty({
    example: '2025-04-05T17:00:00Z',
    description: 'ISO 8601 date string',
  })
  etaDate: string;

  @ValidateNested()
  @Type(() => LocationCreateDto)
  @ApiProperty({
    type: LocationCreateDto,
    description: 'From location details',
  })
  fromLocation: LocationCreateDto;

  @ValidateNested()
  @Type(() => LocationCreateDto)
  @ApiProperty({ type: LocationCreateDto, description: 'To location details' })
  toLocation: LocationCreateDto;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'mission-789',
    description: 'Optional mission ID',
  })
  missionId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'journey-012',
    description: 'Optional journey ID',
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
