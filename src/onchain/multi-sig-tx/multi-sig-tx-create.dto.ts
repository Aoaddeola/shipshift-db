import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayNotEmpty,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MultiSigTx } from './multi-sig-tx.types.js';

export class MultiSigTxCreateDto
  implements
    Omit<MultiSigTx, 'id' | 'createdAt' | 'updatedAt' | 'signatures' | 'status'>
{
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'tx1234567890abcdef',
    description: 'Unique transaction ID',
  })
  txId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'a1b2c3d4e5f6...',
    description: 'Hex-encoded unsigned transaction',
  })
  unsignedTx: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  @ApiProperty({
    example: ['addr1q9abcdef1234567890', 'addr1q8uvwxyz0987654321'],
    description: 'List of signer addresses',
  })
  signers: string[];

  @IsNumber()
  @Min(1)
  @ApiProperty({
    example: 2,
    description: 'Minimum number of signatures required',
    minimum: 1,
  })
  minimumSigners: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'shipment',
    description: 'Database name for the associated entity',
  })
  entityDbName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'shipment-123',
    description: 'ID of the associated entity',
  })
  entityId: string;
}
