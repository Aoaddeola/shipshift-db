import {
  IsString,
  IsArray,
  IsNumber,
  Min,
  IsOptional,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// Nested DTO for signature updates
class SignatureUpdateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'addr1q9abcdef1234567890',
    description: 'Signer address',
  })
  signer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 's1g2n3a4t5u6r7e...',
    description: 'Signature for the transaction',
  })
  signature: string;
}

export class MultiSigTxUpdateDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'tx0987654321fedcba',
    description: 'Updated transaction ID',
  })
  txId?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'b2c3d4e5f6a1...',
    description: 'Updated unsigned transaction',
  })
  unsignedTx?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ApiPropertyOptional({
    example: [
      'addr1q9abcdef1234567890',
      'addr1q8uvwxyz0987654321',
      'addr1q7defghij5678901234',
    ],
    description: 'Updated list of signer addresses',
  })
  signers?: string[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  @ApiPropertyOptional({
    example: 3,
    description: 'Updated minimum number of signatures required',
  })
  minimumSigners?: number;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'shipment',
    description: 'Updated database name for the associated entity',
  })
  entityDbName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'shipment-456',
    description: 'Updated ID of the associated entity',
  })
  entityId?: string;

  @ValidateNested({ each: true })
  @Type(() => SignatureUpdateDto)
  @IsOptional()
  @ApiPropertyOptional({
    type: [SignatureUpdateDto],
    description: 'Signatures to add to the transaction',
  })
  addSignatures?: SignatureUpdateDto[];

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    enum: ['pending', 'completed', 'failed'],
    example: 'completed',
    description: 'Updated status of the transaction',
  })
  status?: 'pending' | 'completed' | 'failed';
}
