// src/multi-sig-tx/multi-sig-tx-create.dto.ts

import { IsString, IsNumber, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MultiSigTx } from './types.js';

export class MultiSigTxCreateDto implements Omit<MultiSigTx, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Unique blockchain transaction ID',
    example: 'tx-789',
  })
  txId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Hex-encoded unsigned transaction',
    example: 'a100020158207070...',
  })
  unsignedTx: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @ApiProperty({
    description: 'List of signer wallet addresses',
    example: ['addr1q9abcdef1234567890', 'addr1q8uvwxyz0987654321'],
    type: [String],
  })
  signers: string[];

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Minimum number of signers required to approve',
    example: 2,
  })
  mininumSigner: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Database name of the associated entity',
    example: 'colony',
  })
  entityDbName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the associated entity',
    example: 'colony-123',
  })
  entityId: string;
}
