import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
  Min,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Agent, AgentType, ConveyanceMeans } from './agent.types.js';

export class AgentCreateDto
  implements Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'operator'>
{
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({
    example: 'Agent Smith',
    description: 'Name of the agent',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'operator-123',
    description: 'ID of the operator',
  })
  operatorId: string;

  @IsNumber()
  @Min(0.001)
  @ApiProperty({
    example: 50,
    description: 'Maximum weight the agent can carry (in kg)',
    minimum: 0.001,
  })
  weightLimit: number;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description:
      'Whether the agent is open to destinations outside their listed scope',
  })
  openToDestinationsOutOfScope: boolean;

  @IsEnum(ConveyanceMeans)
  @IsOptional()
  @ApiProperty({
    enum: ConveyanceMeans,
    example: ConveyanceMeans.Car,
    description: 'Means of conveyance used by the agent',
  })
  meansOfConveyance: ConveyanceMeans;

  @IsEnum(AgentType)
  @ApiProperty({
    enum: AgentType,
    example: AgentType.Business,
    description: 'Type of agent (Business or Private)',
  })
  type: AgentType;
}
