import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MissionStatus } from './mission.types.js';

export class MissionUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'curator-456' })
  curatorId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty({ message: 'journeyIds array cannot be empty when provided' })
  @ApiPropertyOptional({
    example: ['journey-111', 'journey-222'],
    description: 'Array of journey IDs associated with this mission',
  })
  journeyIds?: string[];

  @IsEnum(MissionStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: MissionStatus,
    description: 'Updated status of the mission',
  })
  status?: MissionStatus;
}
