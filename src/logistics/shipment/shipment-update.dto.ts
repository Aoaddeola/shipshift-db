import {
  IsString,
  IsArray,
  IsEnum,
  IsOptional,
  ArrayNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ShipmentStatus } from './shipment.types.js';

export class ShipmentUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'user-789' })
  senderId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'user-012' })
  receiverId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'mission-345' })
  missionId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayNotEmpty({ message: 'stepIds array cannot be empty when provided' })
  @ApiPropertyOptional({
    example: ['step-333', 'step-444'],
    description: 'Updated array of step IDs',
  })
  stepIds?: string[];

  @IsEnum(ShipmentStatus)
  @IsOptional()
  @ApiPropertyOptional({
    enum: ShipmentStatus,
    description: 'Updated status of the shipment',
  })
  status?: ShipmentStatus;
}
