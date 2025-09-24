import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Step, StepState } from './step.types.js';

// Nested DTO for StepOnChain
class StepOnChainDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q9abcdef1234567890' })
  spRecipient: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q8uvwxyz0987654321' })
  spRequester: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q7defghij5678901234' })
  spHolder: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q6klmnopqr4321098765' })
  spPerformer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q5tuvxyz1122334455' })
  spDelegate: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 5000000, description: 'Cost in lovelace' })
  spCost: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '1a2b3c4d#0' })
  spTxOutRef: string;
}

export class StepCreateDto
  implements Omit<Step, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsNumber()
  @Min(0)
  @ApiProperty({ example: 0, description: 'Index of the step in the sequence' })
  index: number;

  @ValidateNested()
  @Type(() => StepOnChainDto)
  @ApiProperty({ type: StepOnChainDto })
  stepParams: StepOnChainDto;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'shipment-123' })
  shipmentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'journey-456' })
  journeyId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'operator-789' })
  operatorId: string;

  @IsEnum(StepState)
  @ApiProperty({
    enum: StepState,
    default: StepState.PENDING,
    description: 'Current state of the step',
  })
  state: StepState = StepState.PENDING;
}
