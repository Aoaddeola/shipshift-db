import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Nested DTO for Location update
class LocationUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '456 Broadway' })
  street?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Los Angeles' })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'CA' })
  state?: string;

  @ValidateNested()
  @Type(() => Array)
  @IsOptional()
  @ApiPropertyOptional({
    example: [-118.2437, 34.0522],
    description: 'Longitude and latitude coordinates',
  })
  coordinates?: [number, number];
}

export class CustomerUpdateDto {
  @ValidateNested()
  @Type(() => LocationUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: LocationUpdateDto })
  address?: LocationUpdateDto;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'contact-456',
    description: 'Updated contact details ID',
  })
  contactDetailsId?: string;
}
