import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Journey, JourneyStatus } from './journey.types.js';
import { ParcelHandlingInfoDto } from '../parcel/parcel-create.dto.js';

export class JourneyCreateDto
  implements Omit<Journey, 'id' | 'createdAt' | 'updatedAt'>
{
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2025-04-01T09:00:00Z' })
  availableFrom: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2025-04-05T17:00:00Z' })
  availableTo: string;

  @IsNumber()
  @Min(0.001)
  @ApiProperty({
    example: 10,
    description: 'Capacity in packages or weight units',
  })
  capacity: number;

  @IsNumber()
  @Min(0)
  @ApiPropertyOptional({ example: 50, description: 'Optional agent fee' })
  price: number;

  @IsEnum(JourneyStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: JourneyStatus,
    default: JourneyStatus.AVAILABLE,
    description: 'Current status of the journey',
  })
  status?: JourneyStatus;

  @ValidateNested()
  @Type(() => ParcelHandlingInfoDto)
  @ApiProperty({ type: ParcelHandlingInfoDto })
  parcelHandlingInfo: ParcelHandlingInfoDto;
}
