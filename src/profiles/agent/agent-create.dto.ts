import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Agent, AgentType, ConveyanceMeans } from './agent.types.js';

export class AgentCreateDto
  implements
    Omit<Agent, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'operator'>
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

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'user-456',
    description: 'ID of the owner (user)',
  })
  ownerId: string;

  @IsBoolean()
  @ApiProperty({
    example: true,
    description:
      'Whether the agent is open to destinations outside their listed scope',
  })
  openToDestinationsOutOfScope: boolean;

  @IsEnum(ConveyanceMeans)
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
