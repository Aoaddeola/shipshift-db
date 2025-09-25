import {
  IsString,
  MinLength,
  MaxLength,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ParcelUpdateDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @ApiPropertyOptional({
    example: 'Updated Package Name',
    description: 'Updated name of the parcel',
    minLength: 3,
    maxLength: 100,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(500)
  @ApiPropertyOptional({
    example: 'Updated description for the parcel',
    description: 'Updated description of the parcel',
    minLength: 10,
    maxLength: 500,
  })
  description?: string;

  @IsUrl({ require_tld: true, protocols: ['http', 'https'] })
  @IsOptional()
  @ApiPropertyOptional({
    example: 'https://example.com/updated-parcel.jpg',
    description: 'Updated URL of the parcel image',
  })
  image?: string;
}
