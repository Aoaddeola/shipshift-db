import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AgentMPFProofUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'operator-456',
    description: 'Updated operator ID',
  })
  operatorId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'f6e5d4c3b2a10987...',
    description: 'Updated root hash',
  })
  rootHash?: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    example: {
      nodes: [
        { hash: 'new-node1', value: 'new-data1' },
        { hash: 'new-node2', value: 'new-data2' },
      ],
      path: ['new-node1', 'new-node2'],
    },
    description: 'Updated proof data structure',
  })
  proof?: object;
}
