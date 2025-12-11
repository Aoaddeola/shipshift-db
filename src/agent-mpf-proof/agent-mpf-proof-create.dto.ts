import {
  IsString,
  IsNotEmpty,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AgentMPFProof } from './agent-mpf-proof.types.js';

export class AgentMPFProofCreateDto
  implements Omit<AgentMPFProof, 'id' | 'createdAt' | 'updatedAt'>
{
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
    example: 'a1b2c3d4e5f67890...',
    description: 'Root hash of the Merkle Patricia Forest',
  })
  rootHash: string;

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  @ApiProperty({
    example: {
      nodes: [
        { hash: 'node1', value: 'data1' },
        { hash: 'node2', value: 'data2' },
      ],
      path: ['node1', 'node2'],
    },
    description: 'Proof data structure',
  })
  proof: object;
}
