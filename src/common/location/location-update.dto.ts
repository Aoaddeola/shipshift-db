import {
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  ArrayNotEmpty,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LocationUpdateDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({
    example: 'Home',
    description: 'Updated name',
    minLength: 2,
    maxLength: 100,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiPropertyOptional({
    example: '456 Broadway',
    description: 'Updated street address',
    minLength: 2,
    maxLength: 100,
  })
  street?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @ApiPropertyOptional({
    example: 'Los Angeles',
    description: 'Updated city name',
    minLength: 2,
    maxLength: 50,
  })
  city?: string;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @ApiPropertyOptional({
    example: 'CA',
    description: 'Updated state or province',
    minLength: 2,
    maxLength: 50,
  })
  state?: string;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    example: 90001,
    description: 'Updated postal or ZIP code',
  })
  postalCode?: number;

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(50)
  @ApiPropertyOptional({
    example: 'USA',
    description: 'Updated country name',
    minLength: 2,
    maxLength: 50,
  })
  country?: string;

  @ValidateNested()
  @Type(() => Array)
  @IsOptional()
  @ArrayNotEmpty()
  @ApiPropertyOptional({
    example: [-118.2437, 34.0522],
    description: 'Updated longitude and latitude coordinates',
  })
  coordinates?: [number, number];
}
