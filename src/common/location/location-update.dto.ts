import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsLatitude,
  IsLongitude,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Nested DTO for Coordinates update
class CoordinatesUpdateDto {
  @IsLongitude()
  @IsOptional()
  @ApiPropertyOptional({
    example: '-118.2437',
    description: 'Updated longitude coordinate',
  })
  longitude?: number;

  @IsLatitude()
  @IsOptional()
  @ApiPropertyOptional({
    example: '34.0522',
    description: 'Updated latitude coordinate',
  })
  latitude?: number;
}

export class LocationUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'user-456',
    description: 'Updated owner ID of the location',
  })
  ownerId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated Home Address',
    description: 'Updated name of the location',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: '456 Broadway',
    description: 'Updated street address',
  })
  street?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Los Angeles',
    description: 'Updated city name',
  })
  city?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'CA',
    description: 'Updated state or region',
  })
  state?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    example: 90001,
    description: 'Updated postal code or ZIP code',
  })
  postalCode?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'USA',
    description: 'Updated country name',
  })
  country?: string;

  @ValidateNested()
  @Type(() => CoordinatesUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({ type: CoordinatesUpdateDto })
  coordinates?: CoordinatesUpdateDto;
}
