import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Agent } from './agent.types.js';

export class AgentCreateDto
  implements Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>
{
  @IsString()
  @IsNotEmpty()
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
    example: 'contact-123',
    description: 'ID of the contact details',
  })
  contactDetailsId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'operator-456',
    description: 'ID of the operator',
  })
  operatorId: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    example: ['journey-789', 'journey-012'],
    description: 'Array of journey IDs published by this agent',
  })
  journeyIds: string[];
}
