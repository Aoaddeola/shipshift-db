// src/pending-multisig-tx-witness/pending-multisig-tx-witness-create.dto.ts

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MultiSigWitness } from './types.js';

export class MultiSigWitnessCreateDto implements Omit<MultiSigWitness, 'id'> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Transaction ID this witness belongs to',
    example: 'tx-123',
  })
  txId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Hex-encoded signed transaction fragment',
    example: 'a100020158207070...',
  })
  signedTx: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Wallet address of the signer',
    example: 'addr1q9abcdef1234567890',
  })
  signer: string;
}
