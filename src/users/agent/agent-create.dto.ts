import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Agent } from './agent.types.js';

export class AgentCreateDto
  implements
    Omit<
      Agent,
      'id' | 'createdAt' | 'updatedAt' | 'contactDetails' | 'operator'
    >
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
}
