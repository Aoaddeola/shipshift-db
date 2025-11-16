import {
  IsString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StepTxDbEntry } from './types.js';
import { StepState } from '../step/step.types.js';
import { Type } from 'class-transformer';

export class StepTxCreateDto implements Omit<StepTxDbEntry, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the associated step',
    example: 'step-123',
  })
  stepId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Blockchain transaction hash',
    example: 'txhash-789',
  })
  transactionHash: string;

  @IsEnum(StepState)
  @ApiProperty({
    description: 'Current state of the transaction',
    enum: StepState,
    example: StepState.PENDING,
  })
  state: StepState;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-01T00:00:00.000Z',
    required: false,
  })
  updatedAt?: Date;
}
