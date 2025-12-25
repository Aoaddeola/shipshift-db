import {
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Offer } from './offer.types.js';

// Nested DTO for bid
class BidDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'mission-123',
    description: 'ID of the mission (optional)',
  })
  missionId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'journey-456',
    description: 'ID of the journey (optional)',
  })
  journeyId?: string;
}

export class OfferCreateDto
  implements Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'shipment-789',
    description: 'ID of the shipment',
  })
  shipmentId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @ApiPropertyOptional({
    example: 50,
    description: 'Number of steps associated with offer',
  })
  stepCount?: number;

  @ValidateNested()
  @Type(() => BidDto)
  @ApiProperty({
    type: BidDto,
    description:
      'Bid details - must include at least one of missionId or journeyId',
  })
  bid: BidDto;
}
