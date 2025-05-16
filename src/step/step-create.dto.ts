// src/step/step-create.dto.ts

import {
  IsString,
  IsObject,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StepParams } from './types.js';
import { ApiProperty } from '@nestjs/swagger';
import { OperatorOnChain } from 'src/colony/types.js';

// Nested DTO for OperatorOnChain
class OperatorOnChainDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q9abcdef1234567890' })
  opAddr: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'ReserveOperator' })
  opRole: string;
}

// Main DTO
export class StepCreateDto implements Omit<StepParams, 'id'> {
  @IsObject()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Cost breakdown with dynamic keys',
    example: { lovelace: 5000000 },
  })
  spCost: Record<string, number>;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q8uvwxyz0987654321' })
  spDelegate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2025-04-01T12:00:00Z' })
  spETA: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q7defghij5678901234' })
  spHolder: string;

  @ValidateNested()
  @Type(() => OperatorOnChainDto)
  @ApiProperty({
    description: 'Performer details',
    type: OperatorOnChainDto,
  })
  spPerformer: OperatorOnChain;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q6klmnopqr4321098765' })
  spRecipient: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q5tuvxyz1122334455' })
  spRequester: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '2025-03-25T09:00:00Z' })
  spStartTime: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1a2b3c4d#0' })
  spTxOutRef: string;
}
