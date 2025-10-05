import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  ValidateNested,
  IsEnum,
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
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

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => String) // Since it's a tuple of strings, not objects
  @ApiProperty({
    example: ['addr1q8uvwxyz0987654321', 'user'],
    description: 'Tuple of [address, role]',
    isArray: true,
  })
  spRequester: [string, string];

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'addr1q7defghij5678901234' })
  spHolder: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => String)
  @ApiProperty({
    example: ['addr1q6klmnopqr4321098765', 'executor'],
    description: 'Tuple of [address, role]',
    isArray: true,
  })
  spPerformer: [string, string];

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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-06-15T10:30:00Z',
    description: 'Estimated Time of Arrival (ISO 8601)',
  })
  spETA: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2024-06-15T09:00:00Z',
    description: 'Start time of the step (ISO 8601)',
  })
  spStartTime: string;
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
