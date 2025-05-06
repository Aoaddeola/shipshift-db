// src/operator/operator-create.dto.ts

import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OperatorType } from '../availability/types.js';
import { AvailabilityDto } from '../availability/availability-create.dto.js';
import { Operator } from './types.js';

export class OperatorCreateDto implements Omit<Operator, 'id'> {
  @IsString()
  @ApiProperty({ example: 'colony-123' })
  colonyId: string;

  @IsString()
  @ApiProperty({ example: 'addr1q9abcdef1234567890' })
  walletAddress: string;

  @IsString()
  @ApiProperty({ example: 'session-789' })
  sessionID: string;

  @IsArray()
  @ApiProperty({ enum: OperatorType, isArray: true })
  roles: OperatorType[];

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ type: AvailabilityDto, isArray: true })
  availability?: AvailabilityDto[];
}
