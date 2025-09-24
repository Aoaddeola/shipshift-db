import { IsString, IsArray, IsOptional, ArrayNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CuratorUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'Updated Curator Name',
    description: 'Updated name of the curator',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'contact-456',
    description: 'Updated contact details ID',
  })
  contactDetailsId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty({ message: 'missionIds array cannot be empty when provided' })
  @ApiPropertyOptional({
    example: ['mission-111', 'mission-222'],
    description: 'Updated array of mission IDs',
  })
  missionIds?: string[];
}
