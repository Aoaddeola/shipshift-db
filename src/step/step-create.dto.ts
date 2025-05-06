// src/step/step-create.dto.ts
import {
  IsObject,
  IsBoolean,
  IsString,
  IsArray,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StepParams } from './types.js';

export class StepCreateDto implements Omit<StepParams, 'id'> {
  @ApiProperty({ description: 'Whether there is an active conflict' })
  @IsBoolean()
  spActiveConflict: boolean;

  @ApiProperty({
    description: 'Cost breakdown with at least "lovelace" specified',
    example: { lovelace: 5000000, ada: 5 },
  })
  @IsObject()
  @IsNotEmpty()
  spCost: Record<string, number>;

  @ApiProperty({ description: 'Delegate address or identifier' })
  @IsString()
  @IsNotEmpty()
  spDelegate: string;

  @ApiProperty({ description: 'Estimated Time of Arrival (ISO 8601 format)' })
  @IsString()
  @IsNotEmpty()
  spETA: string;

  @ApiProperty({ description: 'Current holder of the step' })
  @IsString()
  @IsNotEmpty()
  spHolder: string;

  @ApiProperty({
    description: 'List of performers assigned to the step',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  spPerformer: string[];

  @ApiProperty({ description: 'Recipient of the step outcome' })
  @IsString()
  @IsNotEmpty()
  spRecipient: string;

  @ApiProperty({ description: 'Requester initiating the step' })
  @IsString()
  @IsNotEmpty()
  spRequester: string;

  @ApiProperty({ description: 'Start time of the step (ISO 8601 format)' })
  @IsString()
  @IsNotEmpty()
  spStartTime: string;

  @ApiProperty({
    description: 'Transaction output reference (e.g., Cardano TxOutRef)',
  })
  @IsString()
  @IsNotEmpty()
  spTxOutRef: string;
}
