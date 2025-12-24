import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Nested DTO for bid update
class BidUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'mission-123',
    description: 'Updated mission ID (optional)',
  })
  missionId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'journey-456',
    description: 'Updated journey ID (optional)',
  })
  journeyId?: string;
}

export class OfferUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'shipment-789',
    description: 'Updated shipment ID',
  })
  shipmentId?: string;

  @ValidateNested()
  @Type(() => BidUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({
    type: BidUpdateDto,
    description: 'Updated bid details',
  })
  bid?: BidUpdateDto;
}
