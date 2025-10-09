// src/step-tx/step-tx-create.dto.ts

import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StepTxDbEntry } from './types.js';
import { StepState } from '../step/step.types.js';

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
}
